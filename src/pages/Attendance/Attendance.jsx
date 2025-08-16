import React, { useEffect, useState } from 'react'
import Title from '../../Components/title';
import { Button } from '../../Components/Ui/Button';
import api from '../../libs/apiCall';
import * as XLSX from 'xlsx';
import { BiLoader } from 'react-icons/bi';


const gradeLevels = [
    'الصف الاول الثانوي',
    'الصف الثاني الثانوي',
    'الصف الثاني الثانوي علمي',
    'الصف الثالث الثانوي',
    'احصاء'
];

const months = [
    'اغسطس', 'سبتمبر', 'اكتوبر', 'نوفمبر', 'ديسمبر', 'يناير',
    'فبراير', 'مارس', 'ابريل', 'مايو', 'يونيو', 'يوليو'
];

const Attendance = () => {

    const [students, setStudents] = useState([]);
    const [centers, setCenters] = useState([]);

    const [studentCenter, setStudentCenter] = useState('');
    const [studentGrade, setStudentGrade] = useState('');
    const [attendanceMonth, setAttendanceMonth] = useState('')

    const [isLoading, setIsLoading] = useState(false);

    const [centerAndGradeStudents, setCenterAndGradeStudents] = useState([]);
    const [attendanceData, setAttendanceData] = useState({});

    const [showStudentAttendance, setShowStudentAttendance] = useState(false);
    const [attendanceMonthDisplay, setAttendanceMonthDisplay] = useState('اغسطس')
    const [dataToGetAttendance, setDataToGetAttendance] = useState({ student_id: null, center_id: null, grade: null, month: null });
    const [studentDataForAttendance, setStudentDataForAttendance] = useState([]);

    const [singleStudentAttendance, setSingleStudentAttendance] = useState({});

    const [error, setError] = useState('')

    // sort
    const [sortOrder, setSortOrder] = useState('asc');
    const [sortType, setSortType] = useState('name');

    // to reduce sessions to 5 if grade != "grade3"
    const [numberOfSessions, setNumberOfSessions] = useState(5);

    // handle select
    const [selectedRows, setSelectedRows] = useState([]);

    const userToken = localStorage.getItem('khalednasrSiteToken')

    // useEffect to return user token
    // useEffect(() => {
    //     if (localStorage.getItem('token') !== null) {
    //         setUserToken(localStorage.getItem('token'));
    //     }
    // }, [setUserToken]);

    const getCenters = async () => {
        setIsLoading(true);

        const { data } = await api.get('/centers', {
            headers: { authorization: `Bearer ${userToken}` }
        })

        // console.log(data?.data.centers);
        setCenters(data?.data.centers || []);

        setIsLoading(false);
    }

    // useEffect to get centers- students
    useEffect(() => {
        getCenters();
        setError('');
    }, [])


    // useEffect to reduce sessions to 5 if grade != "grade3"
    useEffect(() => {
        if (studentGrade.includes('الصف الثالث الثانوي')) {
            setNumberOfSessions(8);
        } else {
            setNumberOfSessions(5);
        }
    }, [studentGrade]);

    const getMonthInEnglish = (arabicMonth) => {
        const monthMap = {
            'اغسطس': 'august',
            'سبتمبر': 'september',
            'اكتوبر': 'october',
            'نوفمبر': 'november',
            'ديسمبر': 'december',
            'يناير': 'january',
            'فبراير': 'february',
            'مارس': 'march',
            'ابريل': 'april',
            'مايو': 'may',
            'يونيو': 'june',
            'يوليو': 'july'
        };
        return monthMap[arabicMonth] || arabicMonth;
    }

    const getGradeInEnglish = (arabicGrade) => {
        const gradeMap = {
            'الصف الاول الثانوي': 'grade1',
            'الصف الثاني الثانوي': 'grade2',
            'الصف الثاني الثانوي علمي': 'grade2_specialization_science',
            'الصف الثالث الثانوي': 'grade3',
            'احصاء': 'statistics'
        };
        return gradeMap[arabicGrade] || arabicGrade;
    }


    // handle sort and select
    const sortStudentsAlphabetically = () => {
        const sortedStudents = [...centerAndGradeStudents].sort((a, b) => {
            if (sortOrder === 'asc') {
                return a.name.localeCompare(b.name, 'ar');
            } else {
                return b.name.localeCompare(a.name, 'ar');
            }
        });
        setCenterAndGradeStudents(sortedStudents);
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    }

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
            const { data } = await api.get(`/students?center_id=${center}&grade=${grade}`, {
                headers: {
                    authorization: `Bearer ${userToken}`
                }
            });
            setCenterAndGradeStudents(data.data.students || []);

            console.log(centerAndGradeStudents);

            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching students:', error);
            setError('خطأ أثناء تحميل بيانات الطلاب');
            setIsLoading(false);
        }
    };

    const handleCenterAndGradeStudents = async (e) => {
        e.preventDefault();

        if (!studentCenter || !studentGrade || !attendanceMonth) {
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
        } else if (studentGrade.includes('الصف الاول الثانوي')) {
            grade = 'grade1'
        } else if (studentGrade.includes('الصف الثاني الثانوي')) {
            grade = 'grade2'
        } else if (studentGrade.includes('الصف الثالث الثانوي')) {
            grade = 'grade3'
        } else if (studentGrade.includes('احصاء')) {
            grade = 'statistics'
        }

        let month = getMonthInEnglish(attendanceMonth);

        try {
            setIsLoading(true);
            await getAllStudentsByCenterIdAndGrade(studentCenter, grade);
            await getAllAttendanceByCenterIdAndGradeAndMonth(studentCenter, grade, month);
            setIsLoading(false);

            if (centerAndGradeStudents.length > 0 || Object.keys(attendanceData).length > 0) {
                setError('');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('حدث خطأ أثناء تحميل البيانات');
            setIsLoading(false);
        }
    }

    const getAllAttendanceByCenterIdAndGradeAndMonth = async (center_id, grade, month) => {
        try {
            setIsLoading(true);
            const { data } = await api.get(`/attendance?center_id=${center_id}&grade=${grade}&month=${month}`,
                {
                    headers: {
                        authorization: `Bearer ${userToken}`
                    }
                });
            const attendanceData = data.data.attendance || [];
            const attendanceMap = {};
            attendanceData.forEach(record => {
                attendanceMap[record.student_id] = record;
            });
            setAttendanceData(attendanceMap);

            console.log(attendanceMap);

            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching attendance data:', error);
            setError('حدث خطأ أثناء تحميل بيانات الحضور');
            setIsLoading(false);
        }
    };

    const handleAttendanceChange = (studentId, classNum, isPresent) => {
        const currentAttendance = attendanceData[studentId]?.[`class${classNum}`];

        if (isPresent) {
            // إذا كانت الحالة الحالية true، قم بإلغائها
            setAttendanceData(prevData => ({
                ...prevData,
                [studentId]: {
                    ...prevData[studentId],
                    [`class${classNum}`]: currentAttendance === true ? undefined : true,
                }
            }));
        } else {
            // إذا كانت الحالة الحالية false، قم بإلغائها
            setAttendanceData(prevData => ({
                ...prevData,
                [studentId]: {
                    ...prevData[studentId],
                    [`class${classNum}`]: currentAttendance === false ? undefined : false,
                }
            }));
        }
    };

    const toggleStudentAttendance = async (student_id, center_id, grade) => {
        if (showStudentAttendance) {
            setShowStudentAttendance(false);
        } else {
            setAttendanceMonthDisplay('اغسطس');
            setDataToGetAttendance({ student_id, center_id, grade, month: 'august' });
            await getStudentById(student_id);
            // قم بتحميل بيانات شهر أغسطس مباشرة
            await selectMonthForAttendance(student_id, center_id, grade, 'august');
            setShowStudentAttendance(true);
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
            setStudentDataForAttendance(data.data.student || {});
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching student:', error);
            setError('خطأ أثناء تحميل بيانات الطالب');
            setIsLoading(false);
        }
    }

    const selectMonthForAttendance = async (student_id, center_id, grade, month) => {
        console.log('Fetching attendance for:', { student_id, center_id, grade, month });
        try {
            setIsLoading(true);

            const { data } = await api.get(`/attendance?student_id=${student_id}&center_id=${center_id}&grade=${grade}&month=${month}`,
                {
                    headers: {
                        authorization: `Bearer ${userToken}`
                    }
                });

            console.log("Fetched attendance data:", data);

            const attendanceData = data.data.attendance || [];
            let studentAttendance = {};

            if (attendanceData.length > 0) {
                studentAttendance = attendanceData[0];
            }

            console.log("Setting single student attendance:", studentAttendance);
            setSingleStudentAttendance(studentAttendance);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching attendance:', error);
            setIsLoading(false);
        }
    };

    // const handleSubmitToDisplayAttendance = async (e) => {
    //     e.preventDefault();
    //     const { student_id, center_id, grade } = dataToGetAttendance;

    //     const selectedMonth = getMonthFromDisplay(attendanceMonthDisplay);
    //     console.log('Selected month:', selectedMonth);
    //     setAttendanceMonthDisplay(attendanceMonthDisplay);

    //     await selectMonthForAttendance(student_id, center_id, grade, selectedMonth);
    // };

    // const handleMonthChange = (e) => {
    //     const newMonth = e.target.value;
    //     console.log('Month changed to:', newMonth);
    //     setAttendanceMonthDisplay(newMonth);
    //     const { student_id, center_id, grade } = dataToGetAttendance;
    //     const selectedMonth = getMonthFromDisplay(newMonth);
    //     selectMonthForAttendance(student_id, center_id, grade, selectedMonth);
    // };

    // const getMonthFromDisplay = (displayMonth) => {
    //     const monthMap = {
    //         'اغسطس': 'august',
    //         'سبتمبر': 'september',
    //         'اكتوبر': 'october',
    //         'نوفمبر': 'november',
    //         'ديسمبر': 'december',
    //         'يناير': 'january',
    //         'فبراير': 'february',
    //         'مارس': 'march',
    //         'ابريل': 'april',
    //         'مايو': 'may',
    //         'يونيو': 'june',
    //         'يوليو': 'july',
    //     };
    //     console.log('Converting month:', displayMonth, 'to', monthMap[displayMonth]);
    //     return monthMap[displayMonth] || 'august'; // القيمة الافتراضية
    // };

    const handleSubmit = async () => {
        try {
            setIsLoading(true);
            const grade = getGradeInEnglish(studentGrade);
            const month = getMonthInEnglish(attendanceMonth);

            for (const studentId in attendanceData) {
                const attendanceRecord = {
                    student_id: studentId,
                    center_id: studentCenter,
                    grade: grade,
                    month: month,
                    ...attendanceData[studentId]
                };
                const response = await api.post('/attendance', attendanceRecord, {
                    headers: {
                        authorization: `Bearer ${userToken}`
                    }
                });
                console.log('Response:', response.data); // إضافة سجل هنا
            }
            // alert('تم حفظ بيانات الحضور بنجاح');
        } catch (error) {
            console.error('Error saving attendance data:', error);
            setError('حدث خطأ أثناء حفظ بيانات الحضور');
        } finally {
            setIsLoading(false);
        }
    };

    // handle export to excel
    const exportToExcel = () => {
        const studentsToExport = selectedRows.length > 0
            ? centerAndGradeStudents.filter(student => selectedRows.includes(student.id))
            : centerAndGradeStudents;

        const wsData = [
            ['ID', 'الاسم', ...Array(numberOfSessions).fill().map((_, i) => `حصة ${i + 1}`), `عدد مرات الحضور لشهر ${attendanceMonth}`, 'النسبة المئوية',],
            ...studentsToExport.map(student => {
                const totalClasses = numberOfSessions;
                const attendedClasses = Object.keys(attendanceData[student.id] || {}).filter(key => attendanceData[student.id][key] === true).length;
                const attendancePercentage = totalClasses ? (attendedClasses / totalClasses) * 100 : 0;

                return [
                    student.id,
                    student.name,
                    ...Array(numberOfSessions).fill().map((_, i) =>
                        attendanceData[student.id]?.[`class${i + 1}`] === true ? 'حاضر' :
                            attendanceData[student.id]?.[`class${i + 1}`] === false ? 'غائب' : ''
                    ),
                    `${attendedClasses} / ${totalClasses}`,
                    `${attendancePercentage.toFixed(2)}%`,
                ];
            })
        ];

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
        XLSX.writeFile(wb, `Attendance_${attendanceMonth}_${selectedRows.length > 0 ? 'Selected' : 'All'}.xlsx`);
    };


    return <>

        {isLoading ? <section className='min-h-screen flex justify-center items-center'>
            <BiLoader className='animate-spin w-full text-3xl dark:text-white' />
        </section>

            :

            <section className='sm:p-4 px-2'>
                <Title title='Attendance' />

                {/* form to deisplay students to insert attendance */}
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
                                onChange={(e) => setAttendanceMonth(e.target.value)}
                                value={attendanceMonth}>

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

                    {/* utills */}
                    <div>
                        <div className="flex justify-center items-center my-4">
                            <div className={`mb-2 ${centerAndGradeStudents.length > 1 ? 'flex gap-3' : 'hidden'}`}>
                                <button
                                    className={`py-2 px-4 rounded text-white font-semibold bg-green-600`}
                                    onClick={sortStudentsAlphabetically}
                                >
                                    ترتيب أبجدي حسب الأسم {sortOrder === 'asc' ? '(تصاعدي)' : '(تنازلي)'}
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
                                            colSpan="1"
                                            className="min-w-[160px] border border-gray-800 bg-primary text-white sticky top-0 z-10"
                                        >
                                            حصة {index + 1}
                                        </th>
                                    ))}

                                    <th className="min-w-[120px] p-2 border border-gray-800 bg-primary text-white sticky top-0 z-10">عدد مرات الحضور لشهر {attendanceMonth}</th>
                                    <th className="min-w-[120px] p-2 border border-gray-800 bg-primary text-white sticky top-0 z-10">
                                        النسبة المئوية
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {centerAndGradeStudents.map((student, studentIndex) => {
                                    // console.log(centerAndGradeStudents);

                                    const totalClasses = numberOfSessions;
                                    const attendedClasses = Object.keys(attendanceData[student.id] || {}).filter(key => attendanceData[student.id][key] === true).length;
                                    const attendancePercentage = totalClasses ? (attendedClasses / totalClasses) * 100 : 0;


                                    return (
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
                                                onClick={() => toggleStudentAttendance(student.id, student.center_id, student.grade, 'august')}
                                            >
                                                {student.name}
                                            </td>

                                            {[...Array(numberOfSessions)].map((_, index) => (
                                                <React.Fragment key={index}>
                                                    <td className="border border-gray-800 dark:bg-white">
                                                        <div className="flex justify-around">
                                                            <button
                                                                className={`px-2 py-1 rounded cursor-pointer text-green-600 
                                                                    ${attendanceData[student.id]?.[`class${index + 1}`] === true ? 'bg-green-200' : 'bg-transparent'}`}
                                                                onClick={() => handleAttendanceChange(student.id, index + 1, true)}
                                                            >
                                                                ✔️
                                                            </button>

                                                            <button
                                                                className={`px-2 py-1 rounded cursor-pointer text-red-600 
                                                                    ${attendanceData[student.id]?.[`class${index + 1}`] === false ? 'bg-red-200' : 'bg-transparent'}`}
                                                                onClick={() => handleAttendanceChange(student.id, index + 1, false)}
                                                            >
                                                                ❌
                                                            </button>
                                                        </div>

                                                    </td>
                                                </React.Fragment>
                                            ))}

                                            <td className="border border-gray-800 dark:bg-white">{attendedClasses} / {totalClasses}</td>
                                            <td className="border border-gray-800 dark:bg-white">{attendancePercentage.toFixed(2)}%</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                        {/* </div> */}
                    </div>

                    <div className="flex justify-center gap-4 mt-6">
                        <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">حفظ الحضور</button>
                        <button onClick={exportToExcel} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">تصدير إلى Excel</button>
                    </div>
                </>}



            </section>

        }

    </>
}

export default Attendance