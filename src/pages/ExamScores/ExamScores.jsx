import React, { useEffect, useRef, useState } from 'react'
import api from '../../libs/apiCall';
import * as XLSX from 'xlsx';
import Title from '../../Components/title';
import { Button } from '../../Components/Ui/Button';
import Input from '../../Components/Ui/Input';
import { BiLoader } from 'react-icons/bi';


const gradeLevels = [
    'الصف الاول الثانوي',
    'الصف الثاني الثانوي',
    'الصف الثاني الثانوي علمي',
    'الصف الثاني الثانوي ادبي',
    'الصف الثالث الثانوي',
    'احصاء'
];

const months = [
    'اغسطس', 'سبتمبر', 'اكتوبر', 'نوفمبر', 'ديسمبر', 'يناير',
    'فبراير', 'مارس', 'ابريل', 'مايو', 'يونيو', 'يوليو'
];

const ExamScores = () => {

    const [students, setStudents] = useState([]);
    const [centers, setCenters] = useState([]);

    const [studentCenter, setStudentCenter] = useState('');
    const [studentGrade, setStudentGrade] = useState('');
    const [examMonth, setExamMonth] = useState('')
    const [examNumber, setExamNumber] = useState('');
    const [maxScore, setMaxScore] = useState('');

    const [isLoading, setIsLoading] = useState(false);

    const [centerAndGradeStudents, setCenterAndGradeStudents] = useState([]);
    const [examScores, setExamScores] = useState({});


    // const [allStudentsExamScores, setAllStudentsExamScores] = useState({});
    const [singleStudentExamScores, setSingleStudentExamScores] = useState({});


    // Related to exam scores
    const [showStudentExamScores, setShowStudentExamScores] = useState(false);
    const [examMonthDisplay, setExamMonthDisplay] = useState('august')
    const [dataToGetExamScores, setDataToGetExamScores] = useState({ student_id: null, center_id: null, grade: null, month: null });
    const [studentDataForExamScores, setStudentDataForExamScores] = useState([]);

    const [error, setError] = useState('')

    // sort
    const [sortOrder, setSortOrder] = useState('asc');
    const [sortType, setSortType] = useState('name');
    const [showRanking, setShowRanking] = useState(false);

    // to reduce sessions to 5 if grade != "grade3"
    const [numberOfSessions, setNumberOfSessions] = useState(5);

    // handle select
    const [selectedRows, setSelectedRows] = useState([]);

    const inputRefs = useRef([]);

    const userToken = localStorage.getItem('khalednasrSiteToken')


    const getCenters = async () => {
        setIsLoading(true);

        const { data } = await api.get('/centers', {
            headers: { authorization: `Bearer ${userToken}` }
        })

        // console.log(data?.data.centers);
        setCenters(data?.data.centers || []);

        setIsLoading(false);
    };

    useEffect(() => {
        getCenters();

        // console.log(examScores);

    }, []);


    // handle enter press or arrows to move 
    useEffect(() => {
        inputRefs.current = [];
        for (let i = 0; i < centerAndGradeStudents.length * numberOfSessions * 2; i++) {
            inputRefs.current[i] = null;
        }
    }, [centerAndGradeStudents, numberOfSessions]);

    const handleKeyDown = (event, studentIndex, examNumber, isMax) => {
        const totalInputs = numberOfSessions * 2; // 2 inputs per session (score and max)
        const currentIndex = studentIndex * totalInputs + (examNumber - 1) * 2 + (isMax ? 1 : 0);

        let nextInput;
        switch (event.key) {
            case 'Enter':
            case 'ArrowDown':
                event.preventDefault();
                if (studentIndex + 1 < centerAndGradeStudents.length) {
                    nextInput = inputRefs.current[currentIndex + totalInputs];
                }
                break;
            case 'ArrowUp':
                event.preventDefault();
                if (studentIndex > 0) {
                    nextInput = inputRefs.current[currentIndex - totalInputs];
                }
                break;
            case 'ArrowRight':
                event.preventDefault();
                if (currentIndex % totalInputs < totalInputs - 1) {
                    nextInput = inputRefs.current[currentIndex + 1];
                }
                break;
            case 'ArrowLeft':
                event.preventDefault();
                if (currentIndex % totalInputs > 0) {
                    nextInput = inputRefs.current[currentIndex - 1];
                }
                break;
        }

        if (nextInput) {
            nextInput.focus();
            nextInput.select();
        }
    };

    // useEffect to reduce sessions to 5 if grade != "grade3"
    useEffect(() => {
        if (studentGrade.includes('الصف الثالث الثانوي')) {
            setNumberOfSessions(8);
        } else {
            setNumberOfSessions(5);
        }
    }, [studentGrade]);

    // handle sort ( name - percentage ) and select
    const sortStudents = (type = sortType, order = sortOrder) => {
        let sortedStudents = [...centerAndGradeStudents].sort((a, b) => {
            if (type === 'name') {
                return order === 'asc'
                    ? a.name.localeCompare(b.name, 'ar')
                    : b.name.localeCompare(a.name, 'ar');
            } else if (type === 'percentage') {
                const percentageA = parseFloat(calculatePercentage(examScores[a.id] || {}));
                const percentageB = parseFloat(calculatePercentage(examScores[b.id] || {}));
                return order === 'asc'
                    ? percentageA - percentageB
                    : percentageB - percentageA;
            }
            return 0;
        });

        if (type === 'percentage' && order === 'desc') {
            sortedStudents = sortedStudents.map((student, index) => ({
                ...student,
                ranking: index + 1
            }));
            setShowRanking(true);
        } else {
            setShowRanking(false);
        }

        setCenterAndGradeStudents(sortedStudents);
        setSortType(type);
        setSortOrder(order);
    };

    const toggleSortType = (type) => {
        const newOrder = type === sortType && sortOrder === 'asc' ? 'desc' : 'asc';
        sortStudents(type, newOrder);
    };


    // handle select
    const handleSelectRow = (e, studentId) => {
        e.stopPropagation();
        setSelectedRows(prevSelected => {
            if (prevSelected.includes(studentId)) {
                return prevSelected.filter(id => id !== studentId);
            } else {
                return [...prevSelected, studentId];
            }
        });
    };

    const handleSelectAll = () => {
        if (selectedRows.length === centerAndGradeStudents.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(centerAndGradeStudents.map(student => student.id));
        }
    };

    const handleDeselectAll = () => {
        setSelectedRows([]);
    };


    const getAllStudentsByCenterIdAndGrade = async (center, grade) => {
        try {
            setIsLoading(true);

            const { data } = await api.get(`/students?center_id=${center}&grade=${grade}`,
                {
                    headers: {
                        authorization: `Bearer ${userToken}`
                    }
                });
            setCenterAndGradeStudents(data.data.students || []);

            // console.log(data);

        } catch (error) {
            console.error('خطأ أثناء تحميل بيانات الطلاب ', error);
            setError('خطأ أثناء تحميل بيانات الطلاب ');
        } finally {
            setIsLoading(false);
        }

        setError('');
    };

    // const getAllExamScoresByCenterIdAndGradeAndMonth = async (center_id, grade, month) => {
    //     try {
    //         setIsLoading(true);

    //         const { data } = await api.get(`/exam_scores?center_id=${center_id}&grade=${grade}&month=${month}`,
    //             {
    //                 headers: {
    //                     authorization: `Bearer ${userToken}`
    //                 }
    //             });

    //         console.log(data);

    //         const scoresData = data.data.examScores || [];

    //         if (scoresData.length === 0) {
    //             setError('لا يوجد طلاب بهذه المواصفات');
    //             setExamScores({});
    //         }
    //         else {
    //             const scoresMap = {};

    //             scoresData.forEach(score => {
    //                 if (score && typeof score === 'object') {
    //                     const { totalScore, totalMaxScore, percentage } = calculateTotals(score);
    //                     scoresMap[score.student_id] = {
    //                         ...score,
    //                         totalScore,
    //                         totalMaxScore,
    //                         percentage
    //                     };
    //                 }
    //             });

    //             setExamScores(scoresMap);
    //             setError('');
    //         }

    //     } catch (error) {
    //         console.error('Error fetching students and scores:', error);
    //         setError('حدث خطأ أثناء تحميل بيانات الطلاب والدرجات');
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    const getAllExamScoresByCenterIdAndGradeAndMonth = async (center_id, grade, month) => {
        try {
            setIsLoading(true);

            const { data } = await api.get(`/exam_scores?center_id=${center_id}&grade=${grade}&month=${month}`, {
                headers: {
                    authorization: `Bearer ${userToken}`
                }
            });

            // console.log('Fetched exam scores:', data);

            const scoresData = data.data.examScores || [];

            if (scoresData.length === 0) {
                setError('لا يوجد طلاب بهذه المواصفات');
                setExamScores({});
            } else {
                const scoresMap = {};

                scoresData.forEach(score => {
                    if (score && typeof score === 'object') {
                        // استخدام البيانات من قاعدة البيانات مباشرة بدلاً من الحساب المحلي
                        scoresMap[score.student_id] = {
                            ...score
                            // لا نحتاج لحساب totalScore, totalMaxScore, percentage هنا
                            // لأنها ستأتي من قاعدة البيانات بعد تشغيل الـ trigger
                        };
                    }
                });

                setExamScores(scoresMap);
                setError('');
            }

        } catch (error) {
            console.error('Error fetching students and scores:', error);
            setError('حدث خطأ أثناء تحميل بيانات الطلاب والدرجات');
        } finally {
            setIsLoading(false);
        }
    };



    const handleCenterAndGradeStudents = async (e) => {
        e.preventDefault();

        if (!studentCenter || !studentGrade || !examMonth) {
            setError('برجاء ملئ المدخلات المطلوبة');

            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });

            return;
        }

        setError('');

        let grade = '';

        if (studentGrade.includes('الصف الثاني الثانوي علمي')) {
            grade = 'grade2_specialization_science';
        }
        else if (studentGrade.includes('الصف الثاني الثانوي ادبي')) {
            grade = 'grade2_specialization_arts';
        }
        else if (studentGrade.includes('الصف الاول الثانوي')) {
            grade = 'grade1'
        } else if (studentGrade.includes('الصف الثاني الثانوي')) {
            grade = 'grade2'
        }
        else if (studentGrade.includes('الصف الثالث الثانوي')) {
            grade = 'grade3'
        }
        else if (studentGrade.includes('احصاء')) {
            grade = 'statistics'
        }

        let month = '';

        if (examMonth.includes('اغسطس')) {
            month = 'august';
        } else if (examMonth.includes('سبتمبر')) {
            month = 'september'
        } else if (examMonth.includes('اكتوبر')) {
            month = 'october'
        } else if (examMonth.includes('نوفمبر')) {
            month = 'november'
        } else if (examMonth.includes('ديسمبر')) {
            month = 'december'
        } else if (examMonth.includes('يناير')) {
            month = 'january'
        } else if (examMonth.includes('فبراير')) {
            month = 'february'
        } else if (examMonth.includes('مارس')) {
            month = 'march'
        } else if (examMonth.includes('ابريل')) {
            month = 'april'
        } else if (examMonth.includes('مايو')) {
            month = 'may'
        } else if (examMonth.includes('يونيو')) {
            month = 'june'
        } else if (examMonth.includes('يوليو')) {
            month = 'july'
        }

        try {
            setIsLoading(true);
            await getAllStudentsByCenterIdAndGrade(studentCenter, grade);
            await getAllExamScoresByCenterIdAndGradeAndMonth(studentCenter, grade, month);

            // التحقق من وجود طلاب بعد جلب البيانات
            if (centerAndGradeStudents.length > 0 || Object.keys(examScores).length > 0) {
                setError(''); // تأكيد إفراغ الخطأ إذا وجدت بيانات
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('حدث خطأ أثناء تحميل البيانات');
            setIsLoading(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExamNumberAndScore = async () => {
        if (examNumber && maxScore) {
            setIsLoading(true);

            const updatedScores = {};
            for (const student of centerAndGradeStudents) {
                const updatedStudentScores = {
                    ...examScores[student.id],
                    [`exam${examNumber}_max`]: maxScore
                };
                const { totalScore, totalMaxScore, percentage } = calculateTotals(updatedStudentScores);
                updatedScores[student.id] = {
                    ...updatedStudentScores,
                    totalScore,
                    totalMaxScore,
                    percentage
                };
            }
            setExamScores(updatedScores);

            setIsLoading(false);

            setExamNumber('');
            setMaxScore('');
        }
    };

    // useEffect(() => {
    //     if (students.length > 0) {
    //         const initialScores = {};
    //         students.forEach(student => {
    //             const scores = examScores[student.id] || {};
    //             const { totalScore, totalMaxScore, percentage } = calculateTotals(scores, numberOfSessions);

    //             initialScores[student.id] = {
    //                 ...scores,
    //                 totalScore,
    //                 totalMaxScore,
    //                 percentage
    //             };
    //         });
    //         setExamScores(prev => ({ ...prev, ...initialScores }));
    //     }
    // }, [students, numberOfSessions]);


    // const handleScoreChange = (studentId, examNumber, scoreType, value, numberOfSessions) => {
    //     const scoreValue = isNaN(value) ? value : Number(value); // السماح بأي قيمة

    //     // تحديث الدرجات في الحالة (state)
    //     setExamScores(prevScores => {
    //         const updatedScores = {
    //             ...prevScores,
    //             [studentId]: {
    //                 ...prevScores[studentId],
    //                 [`exam${examNumber}${scoreType ? '_' + scoreType : ''}`]: scoreValue
    //             }
    //         };

    //         // حساب المجموع والنسبة بعد التحديث
    //         const { totalScore, totalMaxScore, percentage } = calculateTotals(updatedScores[studentId], numberOfSessions);

    //         return {
    //             ...updatedScores,
    //             [studentId]: {
    //                 ...updatedScores[studentId],
    //                 totalScore,
    //                 totalMaxScore,
    //                 percentage
    //             }
    //         };
    //     });
    // };

    // const calculateTotals = (studentScores, numberOfSessions) => {
    //     let totalScore = 0;
    //     let totalMaxScore = 0;

    //     // حساب المجموع الكلي والدرجة العظمى بناءً على numberOfSessions الديناميكي
    //     for (let i = 1; i <= numberOfSessions; i++) {
    //         const score = studentScores[`exam${i}`];
    //         const maxScore = studentScores[`exam${i}_max`];

    //         if (score !== undefined && maxScore !== undefined) {
    //             // اعتبار "غ" أو أي حرف آخر كقيمة صفرية
    //             totalScore += (typeof score === 'string' && isNaN(score)) ? 0 : Number(score) || 0;
    //             totalMaxScore += Number(maxScore) || 0;
    //         }
    //     }

    //     const percentage = totalMaxScore > 0 ? (totalScore / totalMaxScore * 100).toFixed(2) : 0;

    //     return { totalScore, totalMaxScore, percentage };
    // };

    const handleScoreChange = (studentId, examNumber, scoreType, value, numberOfSessions) => {
        const scoreValue = isNaN(value) ? value : Number(value); // السماح بأي قيمة

        setExamScores(prevScores => {
            const prevStudentScores = prevScores[studentId] || {};

            // تحديث القيمة الجديدة
            const updatedStudentScores = {
                ...prevStudentScores,
                [`exam${examNumber}${scoreType ? '_' + scoreType : ''}`]: scoreValue
            };

            // حساب المجموع والنسبة
            const { totalScore, totalMaxScore, percentage } = calculateTotals(updatedStudentScores, numberOfSessions);

            // تحديث حالة الطالب بالكامل
            return {
                ...prevScores,
                [studentId]: {
                    ...updatedStudentScores,
                    totalScore,
                    totalMaxScore,
                    percentage
                }
            };
        });
    };

    const calculateTotals = (studentScores, numberOfSessions) => {
        let totalScore = 0;
        let totalMaxScore = 0;

        for (let i = 1; i <= numberOfSessions; i++) {
            const score = studentScores[`exam${i}`];
            const maxScore = studentScores[`exam${i}_max`];

            if (score !== undefined && maxScore !== undefined) {
                totalScore += (typeof score === 'string' && isNaN(score)) ? 0 : Number(score) || 0;
                totalMaxScore += Number(maxScore) || 0;
            }
        }

        const percentage = totalMaxScore > 0 ? (totalScore / totalMaxScore * 100).toFixed(2) : 0;

        return { totalScore, totalMaxScore, percentage };
    };

    const calculatePercentage = (scores) => {
        let totalScore = 0;
        let totalMaxScore = 0;
        for (let i = 1; i <= numberOfSessions; i++) {
            const score = parseFloat(scores[`exam${i}`]) || 0;
            const maxScore = parseFloat(scores[`exam${i}_max`]) || 0;
            totalScore += score;
            totalMaxScore += maxScore;
        }
        return totalMaxScore > 0 ? (totalScore / totalMaxScore * 100).toFixed(2) : 0;
    };



    // const calculateTotals = (studentScores, numberOfSessions = numberOfSessions) => {
    //     let totalScore = 0;
    //     let totalMaxScore = 0;

    //     for (let i = 1; i <= numberOfSessions; i++) {
    //         const score = studentScores[`exam${i}`];
    //         const maxScore = studentScores[`exam${i}_max`];

    //         if (score !== undefined && score !== null && score !== '') {
    //             // معالجة الحروف والقيم غير الرقمية
    //             const numericScore = (typeof score === 'string' && isNaN(score)) ? 0 : Number(score) || 0;
    //             totalScore += numericScore;
    //         }

    //         if (maxScore !== undefined && maxScore !== null && maxScore !== '') {
    //             totalMaxScore += Number(maxScore) || 0;
    //         }
    //     }

    //     const percentage = totalMaxScore > 0 ? (totalScore / totalMaxScore * 100).toFixed(2) : 0;

    //     return { totalScore, totalMaxScore, percentage };
    // };

    // 4. تعديل دالة calculatePercentage لتستخدم البيانات الصحيحة
    // const calculatePercentage = (scores) => {
    //     // إذا كانت البيانات تأتي من قاعدة البيانات مع حقل percentage محسوب
    //     if (scores.percentage !== undefined && scores.percentage !== null) {
    //         return parseFloat(scores.percentage).toFixed(2);
    //     }

    //     // وإلا احسبها محلياً
    //     let totalScore = 0;
    //     let totalMaxScore = 0;

    //     for (let i = 1; i <= numberOfSessions; i++) {
    //         const score = parseFloat(scores[`exam${i}`]) || 0;
    //         const maxScore = parseFloat(scores[`exam${i}_max`]) || 0;
    //         totalScore += score;
    //         totalMaxScore += maxScore;
    //     }

    //     return totalMaxScore > 0 ? (totalScore / totalMaxScore * 100).toFixed(2) : 0;
    // };



    const handleExamScoresDeleteClick = async (student_id, center_id, grade, month) => {
        const confirm = window.confirm('هل انت متأكد من حذف هذه الدرجات للطالب ؟');
        if (confirm) {
            await deleteExamScores(student_id, center_id, grade, month);
        }
    };

    const deleteExamScores = async (student_id, center_id, grade, month) => {
        try {
            setIsLoading(true);

            await api.delete(`/exam_scores?student_id=${student_id}&center_id=${center_id}&grade=${grade}&month=${month}`,
                {
                    headers: {
                        authorization: `Bearer ${userToken}`
                    }
                });

        } catch (error) {
            console.error('Error deleting Exam Scores :', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStudentById = async (student_id) => {
        try {
            setIsLoading(true);

            const { data } = await api.get(`/students/${student_id}`,
                {
                    headers: {
                        authorization: `Bearer ${userToken}`
                    }
                });

            // console.log(data.data);

            setStudentDataForExamScores(data.data.student || []);

        } catch (error) {
            console.error('Error fetching students :', error);
            setError('خطأ أثناء تحميل بيانات الطلاب ');
        } finally {
            setIsLoading(false);
        }

        setError('');
    };

    const toggleStudentExamScores = async (student_id, center_id, grade, month) => {
        if (showStudentExamScores) {
            setExamMonthDisplay('اغسطس');
            setSingleStudentExamScores({});
        } else {
            setExamMonthDisplay('اغسطس');
            setDataToGetExamScores({ student_id, center_id, grade, month: 'august' });
            await getStudentById(student_id);

            try {
                setIsLoading(true);

                const { data } = await api.get(`/exam_scores?student_id=${student_id}&center_id=${center_id}&grade=${grade}&month=august`,
                    {
                        headers: {
                            authorization: `Bearer ${userToken}`
                        }
                    });

                // console.log("Fetched single student scores:", data);

                const scoresData = data.data.examScores || [];
                let studentScores = {};

                if (scoresData.length > 0) {
                    studentScores = scoresData[0];  // Assuming the API returns an array with one object
                    const { totalScore, totalMaxScore, percentage } = calculateTotals(studentScores);
                    studentScores = {
                        ...studentScores,
                        totalScore,
                        totalMaxScore,
                        percentage
                    };
                }

                setSingleStudentExamScores(studentScores);

            } catch (error) {
                console.error('Error fetching exam scores:', error);
                setIsLoading(false);
            } finally {
                setIsLoading(false);
            }
        }

        setShowStudentExamScores(!showStudentExamScores);
    };

    const selectMonthForExamScores = async (student_id, center_id, grade) => {
        let month = '';

        switch (true) {
            case examMonthDisplay.includes('اغسطس'):
                month = 'august';
                break;
            case examMonthDisplay.includes('سبتمبر'):
                month = 'september';
                break;
            case examMonthDisplay.includes('اكتوبر'):
                month = 'october';
                break;
            case examMonthDisplay.includes('نوفمبر'):
                month = 'november';
                break;
            case examMonthDisplay.includes('ديسمبر'):
                month = 'december';
                break;
            case examMonthDisplay.includes('يناير'):
                month = 'january';
                break;
            case examMonthDisplay.includes('فبراير'):
                month = 'february'; // تأكد من كتابة "فبراير" بشكل صحيح
                break;
            case examMonthDisplay.includes('مارس'):
                month = 'march';
                break;
            case examMonthDisplay.includes('ابريل'):
                month = 'april';
                break;
            case examMonthDisplay.includes('مايو'):
                month = 'may';
                break;
            case examMonthDisplay.includes('يونيو'):
                month = 'june';
                break;
            case examMonthDisplay.includes('يوليو'):
                month = 'july';
                break;
            default:
                console.error('Unknown month selected:', examMonthDisplay);
                return; // أو عالج الحالة الافتراضية
        }

        setExamMonthDisplay(month);

        try {
            setIsLoading(true);

            const { data } = await api.get(`/exam_scores?student_id=${student_id}&center_id=${center_id}&grade=${grade}&month=${month}`,
                {
                    headers: {
                        authorization: `Bearer ${userToken}`
                    }
                });

            // console.log("Fetched scores for month:", data);

            const scoresData = data.data.examScores || [];
            let studentScores = {};

            if (scoresData.length > 0) {
                studentScores = scoresData[0];  // Assuming the API returns an array with one object
                const { totalScore, totalMaxScore, percentage } = calculateTotals(studentScores);
                studentScores = {
                    ...studentScores,
                    totalScore,
                    totalMaxScore,
                    percentage
                };
            }

            setSingleStudentExamScores(studentScores);

        } catch (error) {
            console.error('Error fetching exam scores:', error);
            setIsLoading(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitToDisplayGrades = async (e) => {
        e.preventDefault();

        const { student_id, center_id, grade, month } = dataToGetExamScores;
        await selectMonthForExamScores(student_id, center_id, grade, examMonthDisplay);
    };

    // const handleSubmit = async () => {
    //     try {
    //         setIsLoading(true);

    //         let grade = '';

    //         if (studentGrade.includes('الصف الثاني الثانوي علمي')) {
    //             grade = 'grade2_specialization_science';
    //         }
    //         else if (studentGrade.includes('الصف الثاني الثانوي ادبي')) {
    //             grade = 'grade2_specialization_arts';
    //         }
    //         else if (studentGrade.includes('الصف الاول الثانوي')) {
    //             grade = 'grade1'
    //         } else if (studentGrade.includes('الصف الثاني الثانوي')) {
    //             grade = 'grade2'
    //         }
    //         else if (studentGrade.includes('الصف الثالث الثانوي')) {
    //             grade = 'grade3'
    //         }
    //         else if (studentGrade.includes('احصاء')) {
    //             grade = 'statistics'
    //         }

    //         let month = '';

    //         if (examMonth.includes('اغسطس')) {
    //             month = 'august';
    //         } else if (examMonth.includes('سبتمبر')) {
    //             month = 'september'
    //         } else if (examMonth.includes('اكتوبر')) {
    //             month = 'october'
    //         } else if (examMonth.includes('نوفمبر')) {
    //             month = 'november'
    //         } else if (examMonth.includes('ديسمبر')) {
    //             month = 'december'
    //         } else if (examMonth.includes('يناير')) {
    //             month = 'january'
    //         } else if (examMonth.includes('فبراير')) {
    //             month = 'february'
    //         } else if (examMonth.includes('مارس')) {
    //             month = 'march'
    //         } else if (examMonth.includes('ابريل')) {
    //             month = 'april'
    //         } else if (examMonth.includes('مايو')) {
    //             month = 'may'
    //         } else if (examMonth.includes('يونيو')) {
    //             month = 'june'
    //         } else if (examMonth.includes('يوليو')) {
    //             month = 'july'
    //         }

    //         for (const studentId in examScores) {
    //             const scoreData = {
    //                 student_id: studentId,
    //                 center_id: studentCenter,
    //                 grade: grade,
    //                 month: month,
    //                 ...examScores[studentId]
    //             };
    //             await api.post('/exam_scores', scoreData,
    //                 {
    //                     headers: {
    //                         authorization: `Bearer ${userToken}`
    //                     }
    //                 });
    //         }
    //         alert('تم حفظ الدرجات بنجاح');
    //     } catch (error) {
    //         console.error('Error saving exam scores:', error);
    //         setError('حدث خطأ أثناء حفظ درجات الامتحانات');
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    // handle export to excel

    const handleSubmit = async () => {
        try {
            setIsLoading(true);

            let grade = '';
            if (studentGrade.includes('الصف الثاني الثانوي علمي')) {
                grade = 'grade2_specialization_science';
            }
            else if (studentGrade.includes('الصف الثاني الثانوي ادبي')) {
                grade = 'grade2_specialization_arts';
            }
            else if (studentGrade.includes('الصف الاول الثانوي')) {
                grade = 'grade1'
            } else if (studentGrade.includes('الصف الثاني الثانوي')) {
                grade = 'grade2'
            }
            else if (studentGrade.includes('الصف الثالث الثانوي')) {
                grade = 'grade3'
            }
            else if (studentGrade.includes('احصاء')) {
                grade = 'statistics'
            }

            let month = '';
            if (examMonth.includes('اغسطس')) {
                month = 'august';
            } else if (examMonth.includes('سبتمبر')) {
                month = 'september'
            } else if (examMonth.includes('اكتوبر')) {
                month = 'october'
            } else if (examMonth.includes('نوفمبر')) {
                month = 'november'
            } else if (examMonth.includes('ديسمبر')) {
                month = 'december'
            } else if (examMonth.includes('يناير')) {
                month = 'january'
            } else if (examMonth.includes('فبراير')) {
                month = 'february'
            } else if (examMonth.includes('مارس')) {
                month = 'march'
            } else if (examMonth.includes('ابريل')) {
                month = 'april'
            } else if (examMonth.includes('مايو')) {
                month = 'may'
            } else if (examMonth.includes('يونيو')) {
                month = 'june'
            } else if (examMonth.includes('يوليو')) {
                month = 'july'
            }

            // حفظ الدرجات لكل طالب منفرداً
            for (const studentId in examScores) {
                const studentScores = examScores[studentId];

                // تحضير البيانات للإرسال - إزالة الحقول المحسوبة محلياً
                const scoreData = {
                    student_id: parseInt(studentId),
                    center_id: parseInt(studentCenter),
                    grade: grade,
                    month: month,
                    // إرسال الدرجات كما هي من قاعدة البيانات
                    exam1: studentScores.exam1 || null,
                    exam1_max: studentScores.exam1_max || null,
                    exam2: studentScores.exam2 || null,
                    exam2_max: studentScores.exam2_max || null,
                    exam3: studentScores.exam3 || null,
                    exam3_max: studentScores.exam3_max || null,
                    exam4: studentScores.exam4 || null,
                    exam4_max: studentScores.exam4_max || null,
                    exam5: studentScores.exam5 || null,
                    exam5_max: studentScores.exam5_max || null,
                    exam6: studentScores.exam6 || null,
                    exam6_max: studentScores.exam6_max || null,
                    exam7: studentScores.exam7 || null,
                    exam7_max: studentScores.exam7_max || null,
                    exam8: studentScores.exam8 || null,
                    exam8_max: studentScores.exam8_max || null,
                    user_id: null // سيتم تعيينه في الباك إند
                };

                // console.log('Saving score data:', scoreData);

                await api.post('/exam_scores', scoreData, {
                    headers: {
                        authorization: `Bearer ${userToken}`
                    }
                });
            }

            // alert('تم حفظ الدرجات بنجاح');

            // إعادة تحميل البيانات لإظهار الحسابات المحدثة
            await getAllExamScoresByCenterIdAndGradeAndMonth(studentCenter, grade, month);

        } catch (error) {
            console.error('Error saving exam scores:', error);
            setError('حدث خطأ أثناء حفظ درجات الامتحانات');
            alert('حدث خطأ أثناء حفظ الدرجات');
        } finally {
            setIsLoading(false);
        }
    };

    const exportToExcel = () => {
        const studentsToExport = selectedRows.length > 0
            ? centerAndGradeStudents.filter(student => selectedRows.includes(student.id))
            : centerAndGradeStudents;

        const wsData = [
            ['ID', 'الاسم', ...Array(numberOfSessions).fill().map((_, i) => [`حصة ${i + 1}`, 'العظمى']).flat(), 'مجموع الدرجات', 'مجموع العظمى', 'النسبة المئوية'],
            ...studentsToExport.map(student => {
                const scores = examScores[student.id] || {};
                return [
                    student.id,
                    student.name,
                    ...Array(numberOfSessions).fill().map((_, i) => [
                        scores[`exam${i + 1}`] || '',
                        scores[`exam${i + 1}_max`] || ''
                    ]).flat(),
                    scores.totalScore || 0,
                    scores.totalMaxScore || 0,
                    `${calculatePercentage(scores)}%`
                ];
            })
        ];

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Exam Scores');
        XLSX.writeFile(wb, `Exam_Scores_${examMonth}_${selectedRows.length > 0 ? 'Selected' : 'All'}.xlsx`);
    };


    return <>
        {isLoading ? <section className='min-h-screen flex justify-center items-center'>
            <BiLoader className='animate-spin w-full text-3xl dark:text-white' />
        </section>

            :

            <section className='sm:p-4 px-2'>
                <Title title='Exam Scores' />

                {/* form to deisplay students to insert scores */}
                <div className='displayStudents'>
                    <form onSubmit={handleCenterAndGradeStudents}>
                        <div className="formInputs sm:flex justify-evenly items-center">

                            <select id="studentCenter" className='block sm:w-1/4 w-full rounded-md p-2 my-2 bg-white dark:bg-gray-900 dark:placeholder:text-gray-300 dark:text-white border-gray-300 shadow-sm",
                        "focus:border-primary focus:ring focus:ring-primary focus:outline-none focus:ring-opacity-50",
                        "placeholder-gray-400",
                        "disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed'
                                onChange={(e) => setStudentCenter(e.target.value)}
                                value={studentCenter}>

                                <option value="">
                                    اختر السنتر
                                </option>

                                {centers.map((center => (
                                    <option key={center.id} value={center.id}>
                                        {center.name}
                                    </option>
                                )))}
                            </select>

                            <select id="studentGrade" className='block sm:w-1/4 w-full rounded-md p-2 my-2 bg-white dark:bg-gray-900 dark:placeholder:text-gray-300 dark:text-white border-gray-300 shadow-sm",
                        "focus:border-primary focus:ring focus:ring-primary focus:outline-none focus:ring-opacity-50",
                        "placeholder-gray-400",
                        "disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed'
                                onChange={(e) => setStudentGrade(e.target.value)}
                                value={studentGrade}>

                                <option value=""> أختر الصف الدراسي</option>

                                {gradeLevels.map((grade) => (
                                    <option value={grade} key={grade}>
                                        {grade}
                                    </option>
                                ))}
                            </select>

                            <select id="examMonth" className='block sm:w-1/4 w-full rounded-md p-2 my-2 bg-white dark:bg-gray-900 dark:placeholder:text-gray-300 dark:text-white border-gray-300 shadow-sm",
                        "focus:border-primary focus:ring focus:ring-primary focus:outline-none focus:ring-opacity-50",
                        "placeholder-gray-400",
                        "disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed'
                                onChange={(e) => setExamMonth(e.target.value)}
                                value={examMonth}>

                                <option value=""> اختر الشهر </option>

                                {months.map((month, index) => (
                                    <option value={month} key={index}>
                                        {month}
                                    </option>
                                ))}
                            </select>

                            <Button
                                type="submit"
                                className='my-2 sm:my-0'
                            >
                                عرض الطلاب
                            </Button>
                        </div>
                    </form>
                </div>

                {centerAndGradeStudents.length > 0 && <>

                    {/* utilities */}
                    <div>
                        <div className="mt-5">
                            <div className="flex justify-center gap-3 my-4">
                                <select
                                    className=' sm:w-1/4 w-full rounded-md p-2 my-2 bg-white dark:bg-gray-900 dark:placeholder:text-gray-300 dark:text-white border-gray-300 shadow-sm",
                        "focus:border-primary focus:ring focus:ring-primary focus:outline-none focus:ring-opacity-50",
                        "placeholder-gray-400",
                        "disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed'
                                    value={examNumber}
                                    onChange={(e) => setExamNumber(e.target.value)}
                                >
                                    <option value=''>اختر رقم الحصة</option>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num, index) => (
                                        <option key={index} value={num}>{num}</option>
                                    ))}
                                </select>

                                <Input
                                    type="number"
                                    className="w-full bg-white"
                                    value={maxScore}
                                    onChange={(e) => setMaxScore(e.target.value)}
                                    placeholder="الدرجة العظمى"
                                />
                            </div>

                            <div className='flex justify-center'>
                                <Button
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                                    onClick={handleExamNumberAndScore}
                                >
                                    تأكيد الدرجة العظمي
                                </Button>
                            </div>
                        </div>

                        <div className="flex justify-center items-center my-4">
                            <div className={`mb-2 ${centerAndGradeStudents.length > 1 ? 'flex gap-3' : 'hidden'}`}>
                                <button
                                    className={`py-2 px-4 rounded text-white font-semibold ${sortType === 'name' ? 'bg-green-600' : 'bg-gray-500'}`}
                                    onClick={() => toggleSortType('name')}
                                >
                                    ترتيب أبجدي {sortOrder === 'asc' ? '(تصاعدي)' : '(تنازلي)'}
                                </button>
                                <button
                                    className={`py-2 px-4 rounded text-white font-semibold ${sortType === 'percentage' ? 'bg-green-600' : 'bg-gray-500'}`}
                                    onClick={() => toggleSortType('percentage')}
                                >
                                    ترتيب حسب النسبة المئوية {sortOrder === 'asc' ? '(تصاعدي)' : '(تنازلي)'}
                                </button>
                            </div>
                        </div>

                        <div className="container mx-auto text-center">
                            <span className="bg-gray-800 text-white rounded-full px-4 py-2">
                                عدد الطلاب : {centerAndGradeStudents.length}
                            </span>

                            {selectedRows.length === 0 && (
                                <button
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ml-3 mt-3"
                                    onClick={handleSelectAll}
                                >
                                    تحديد الكل
                                </button>
                            )}

                            {selectedRows.length > 0 && (
                                <>
                                    <button
                                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ml-3 mt-3"
                                        onClick={handleSelectAll}
                                    >
                                        تحديد الكل
                                    </button>

                                    <button
                                        className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded ml-3 mt-3"
                                        onClick={handleDeselectAll}
                                    >
                                        إلغاء التحديد
                                    </button>
                                </>
                            )}
                        </div>
                    </div>


                    {/* students table to insert scores */}
                    <div className="w-[420px] mt-10 sm:flex flex-col justify-center items-center sm:w-full overflow-x-auto h-full">
                        {/* <div className=""> */}
                        <table className="border-separate border-spacing-0 min-w-max sm:text-lg rounded-lg text-center">
                            <thead>
                                <tr>
                                    <th className="min-w-[80px] p-2 border border-gray-800 bg-primary text-white sticky top-0 z-10">Select</th>
                                    <th className="min-w-[80px] p-2 border border-gray-800 bg-primary text-white sticky top-0 z-10">Id</th>
                                    <th className="min-w-[120px] p-2 border border-gray-800 bg-primary text-white sticky top-0 left-0 z-20">الطالب</th>

                                    {[...Array(numberOfSessions)].map((_, index) => (
                                        <th
                                            key={`header-${index}`}
                                            colSpan="2"
                                            className="min-w-[160px] border border-gray-800 bg-primary text-white sticky top-0 z-10"
                                        >
                                            حصة {index + 1}
                                        </th>
                                    ))}

                                    <th className="min-w-[120px] p-2 border border-gray-800 bg-primary text-white sticky top-0 z-10" colSpan="3">
                                        مجموع الدرجات
                                    </th>
                                </tr>

                                <tr>
                                    <th></th>
                                    <th></th>
                                    <th></th>

                                    {[...Array(numberOfSessions)].map((_, index) => (
                                        <React.Fragment key={`sub-header-${index}`}>
                                            <th className="min-w-[80px] p-2 border border-gray-800 bg-primary text-white sticky top-0 z-10">الدرجة</th>
                                            <th className="min-w-[80px] p-2 border border-gray-800 bg-primary text-white sticky top-0 z-10">العظمى</th>
                                        </React.Fragment>
                                    ))}

                                    <th className="min-w-[100px] p-2 border border-gray-800 bg-primary text-white sticky top-0 z-10">درجات الطالب</th>
                                    <th className="min-w-[100px] p-2 border border-gray-800 bg-primary text-white sticky top-0 z-10">العظمى</th>
                                    <th className="min-w-[100px] p-2 border border-gray-800 bg-primary text-white sticky top-0 z-10">النسبة المئوية</th>
                                </tr>
                            </thead>

                            <tbody>
                                {centerAndGradeStudents.map((student, studentIndex) => (
                                    <tr
                                        key={student.id}
                                        className={`${selectedRows.includes(student.id) ? 'bg-gray-400' : ''}`}
                                    >
                                        <td className="border border-gray-800 dark:bg-white">
                                            <div className="flex justify-center">
                                                <div
                                                    className={`w-4 h-4 border-2 rounded-full cursor-pointer ${selectedRows.includes(student.id) ? 'bg-primary' : ''}`}
                                                    onClick={(e) => handleSelectRow(e, student.id)}
                                                ></div>
                                            </div>
                                        </td>

                                        <td className="border border-gray-800 bg-primary text-white">{student.id}</td>

                                        <td
                                            className="border border-gray-800 bg-primary text-white sticky left-0 z-20"
                                            onClick={() => toggleStudentExamScores(student.id, student.center_id, student.grade, 'august')}
                                        >
                                            {student.name}
                                        </td>

                                        {[...Array(numberOfSessions)].map((_, index) => (
                                            <React.Fragment key={index}>
                                                <td className="border border-gray-800">
                                                    <input
                                                        type="text"
                                                        className={`form-input w-[50px] px-2 py-1 bg-gray-100 ${selectedRows.includes(student.id) ? 'bg-gray-400 text-white' : ''}`}
                                                        value={examScores[student.id]?.[`exam${index + 1}`] || ''}
                                                        onChange={(e) => handleScoreChange(student.id, index + 1, '', e.target.value)}
                                                        onKeyDown={(e) => handleKeyDown(e, studentIndex, index + 1, false)}
                                                        ref={el => inputRefs.current[studentIndex * numberOfSessions * 2 + index * 2] = el}
                                                    />
                                                </td>
                                                <td className="border border-gray-800">
                                                    <input
                                                        type="text"
                                                        className={`form-input w-[50px] px-2 py-1 bg-gray-100 ${selectedRows.includes(student.id) ? 'bg-gray-400 text-white' : ''}`}
                                                        value={examScores[student.id]?.[`exam${index + 1}_max`] || ''}
                                                        onChange={(e) => handleScoreChange(student.id, index + 1, 'max', e.target.value)}
                                                        onKeyDown={(e) => handleKeyDown(e, studentIndex, index + 1, true)}
                                                        ref={el => inputRefs.current[studentIndex * numberOfSessions * 2 + index * 2 + 1] = el}
                                                    />
                                                </td>
                                            </React.Fragment>
                                        ))}

                                        <td className="border border-gray-800">
                                            {/* <input
                                            type="text"
                                            className={`form-input w-[80px] px-2 py-1 ${selectedRows.includes(student.id) ? 'bg-gray-400 text-white' : ''}`}
                                            disabled
                                            value={examScores[student.id]?.totalScore || ''}
                                        /> */}

                                            <input
                                                type="text"
                                                className={`form-input w-[80px] px-2 py-1 ${selectedRows.includes(student.id) ? 'bg-gray-400 text-white' : ''}`}
                                                disabled
                                                value={examScores[student.id]?.total_score ?? ""}
                                            />
                                        </td>

                                        <td className="border border-gray-800">
                                            {/* <input
                                            type="text"
                                            className={`form-input w-[80px] px-2 py-1 ${selectedRows.includes(student.id) ? 'bg-gray-400 text-white' : ''}`}
                                            disabled
                                            value={examScores[student.id]?.totalMaxScore || ''}
                                        /> */}

                                            <input
                                                type="text"
                                                className={`form-input w-[80px] px-2 py-1 ${selectedRows.includes(student.id) ? 'bg-gray-400 text-white' : ''}`}
                                                disabled
                                                value={examScores[student.id]?.total_max_score ?? ''}
                                            />
                                        </td>

                                        <td className="border border-gray-800">
                                            <input
                                                type="text"
                                                className={`form-input w-[80px] px-2 py-1 ${selectedRows.includes(student.id) ? 'bg-gray-400 text-white' : ''}`}
                                                disabled
                                                value={`${examScores[student.id]?.percentage ?? ''}%`}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {/* </div> */}
                    </div>

                    <div className="flex justify-center gap-4 mt-6">
                        <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">حفظ الدرجات</button>
                        <button onClick={exportToExcel} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">تصدير إلى Excel</button>
                    </div>
                </>}

            </section>}
    </>
}

export default ExamScores