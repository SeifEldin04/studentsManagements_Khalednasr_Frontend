import React, { useEffect, useState } from 'react'
import api from '../../libs/apiCall'
import Input from '../../Components/Ui/Input';
import { Button } from '../../Components/Ui/Button';
import { BiLoader } from 'react-icons/bi';
import Title from '../../Components/title';
import * as XLSX from 'xlsx';


const StudentsDegrees = () => {
    const [centers, setCenters] = useState([])
    const [students, setStudents] = useState([]);
    const [allStudents, setAllStudents] = useState([]);

    // Related to search student
    const [searchName, setSearchName] = useState('');
    const [searchGrade, setSearchGrade] = useState('');
    const [searchSchool, setSearchSchool] = useState('');
    const [searchPhone, setSearchPhone] = useState('');
    const [searchGuardianPhone, setSearchGuardianPhone] = useState('');
    const [searchCenter, setSearchCenter] = useState('');

    const [isSearchActive, setIsSearchActive] = useState(false);

    // handle sort
    const [sortOrder, setSortOrder] = useState('asc');
    const [sortType, setSortType] = useState('name');
    const [showRanking, setShowRanking] = useState(false);

    // handle select
    const [selectedRows, setSelectedRows] = useState([]);

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('');

    const userToken = localStorage.getItem('khalednasrSiteToken')


    const getCenters = async () => {
        setIsLoading(true);

        const { data } = await api.get('/centers', {
            headers: { authorization: `Bearer ${userToken}` }
        })

        // console.log(data?.data.centers);
        setCenters(data?.data.centers || []);

        setIsLoading(false);
    }

    const getStudents = async () => {
        setIsLoading(true);

        const { data } = await api.get('/students', {
            headers: { authorization: `Bearer ${userToken}` }
        })

        console.log(data?.data.students);
        setAllStudents(data?.data.students || []);
        setStudents(data?.data.students || []);

        setIsLoading(false);
    }

    // get centers , students
    useEffect(() => {
        getCenters();
        getStudents();
    }, []);

    // handle search
    useEffect(() => {
        const filteredStudents = allStudents.filter(student => {
            const matchesName = searchName ? student.name.toLowerCase().includes(searchName.toLowerCase()) : true;

            // التحقق من قيمة الصف وتفريق الصف الثاني الثانوي والصف الثاني الثانوي علمي
            const matchesGrade = searchGrade ? (
                (searchGrade === 'الصف الثاني الثانوي' && student.grade === 'grade2') ||
                (searchGrade === 'الصف الثاني الثانوي علمي' && student.grade === 'grade2_specialization_science') ||
                (searchGrade === 'الصف الاول الثانوي' && student.grade === 'grade1') ||
                (searchGrade === 'الصف الثالث الثانوي' && student.grade === 'grade3') ||
                (searchGrade === 'احصاء' && student.grade === 'statistics')
            ) : true;

            const matchesSchool = searchSchool ? student.school.toLowerCase().includes(searchSchool.toLowerCase()) : true;
            const matchesCenter = searchCenter ? student.center_name.toLowerCase().includes(searchCenter.toLowerCase()) : true;
            const matchesPhone = searchPhone ? student.phone_number.toLowerCase().includes(searchPhone.toLowerCase()) : true;
            const matchesGuardianPhone = searchGuardianPhone ? student.guardian_phone_number.toLowerCase().includes(searchGuardianPhone.toLowerCase()) : true;

            return matchesName && matchesGrade && matchesSchool && matchesCenter && matchesPhone && matchesGuardianPhone;
        });

        setStudents(filteredStudents);
    }, [searchName, searchGrade, searchSchool, searchCenter, searchPhone, searchGuardianPhone, allStudents]);

    const clearSearch = () => {
        setSearchName('');
        setSearchGrade('');
        setSearchCenter('');
        setSearchPhone('');
        setSearchSchool('');
        setSearchGuardianPhone('');
    }

    const handleSearch = (setter) => (e) => {
        const value = e.target.value;
        setter(value);
        setIsSearchActive(!!value);
    };


    // handle sort ( name - percentage ) and select
    const sortStudents = (type = sortType, order = sortOrder) => {
        let sortedStudents = [...students].sort((a, b) => {
            if (type === 'name') {
                return order === 'asc'
                    ? a.name.localeCompare(b.name, 'ar')
                    : b.name.localeCompare(a.name, 'ar');
            } else if (type === 'percentage') {
                return order === 'asc'
                    ? a.percentage - b.percentage
                    : b.percentage - a.percentage;
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

        setStudents(sortedStudents);
        setSortType(type);
        setSortOrder(order);
    }

    const toggleSortType = (type) => {
        const newOrder = type === sortType && sortOrder === 'asc' ? 'desc' : 'asc';
        sortStudents(type, newOrder);
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
        if (selectedRows.length === students.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(students.map(student => student.id));
        }
    };

    const handleDeselectAll = () => {
        setSelectedRows([]);
    };


    // handle export to excel
    const exportToExcel = () => {
        const studentsToExport = selectedRows.length > 0
            ? students.filter(student => selectedRows.includes(student.id))
            : students;

        const wsData = [
            ['ID', 'اسم الطالب', 'الصف الدراسي', 'المدرسة', 'السنتر', 'درجات الطالب الكلية ', 'الدرجة العظمي ', 'النسبة المئوية %', showRanking ? 'الترتيب' : ''],
            ...studentsToExport.map(student => {
                const studentss = students[student.id] || {};
                return [
                    student.id,
                    student.name,
                    (() => {
                        switch (student.grade) {
                            case 'grade1':
                                return 'الصف الاول الثانوي';
                            case 'grade2':
                                return 'الصف الثاني الثانوي';
                            case 'grade2_specialization_science':
                                return 'الصف الثاني الثانوي علمي';
                            case 'grade3':
                                return 'الصف الثالث الثانوي';
                            case 'statistics':
                                return 'احصاء';
                            default:
                                return '';
                        }
                    })(),
                    student.school,
                    student.center_name,
                    student.total_score,
                    student.total_max_score,
                    student.percentage,
                    showRanking ? student.ranking : ''
                ];
            })
        ];

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Students Degrees');
        XLSX.writeFile(wb, `Students_Degrees_${selectedRows.length > 0 ? 'Selected' : 'All'}.xlsx`);
    };


    return <>
        {isLoading ? <section className='min-h-screen flex justify-center items-center'>
            <BiLoader className='animate-spin w-full text-3xl dark:text-white' />
        </section>

            :

            <section className='sm:p-4'>
                <Title title='Students Degrees' />

                {/* search , reset search button*/}
                <div className="search w-full">
                    {/* Search Inputs */}
                    <div className="">
                        <div className="flex gap-4">
                            <div className="w-1/2">
                                <Input type="text" className='bg-white' placeholder='بحث عبر الاسم'
                                    onChange={handleSearch(setSearchName)}
                                    value={searchName}
                                />
                            </div>

                            <div className="w-1/2">
                                <select id="" className='block w-full rounded-md p-2 my-2 bg-white dark:bg-gray-900 dark:placeholder:text-gray-300 dark:text-white border-gray-300 shadow-sm",
                        "focus:border-primary focus:ring focus:ring-primary focus:outline-none focus:ring-opacity-50",
                        "placeholder-gray-400",
                        "disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed'
                                    onChange={handleSearch(setSearchGrade)}
                                    value={searchGrade}>

                                    <option value=""> أختر الصف الدراسي</option>

                                    <option value="الصف الاول الثانوي"> الصف الاول الثانوي </option>

                                    <option value="الصف الثاني الثانوي"> الصف الثاني الثانوي </option>

                                    <option value="الصف الثاني الثانوي علمي"> الصف الثاني الثانوي علمي</option>

                                    <option value="الصف الثالث الثانوي"> الصف الثالث الثانوي</option>

                                    <option value="احصاء"> احصاء </option>
                                </select>
                            </div>
                        </div>

                        <div className='flex gap-4'>
                            <div className='w-1/2'>
                                <Input type="text" className='bg-white' placeholder='بحث عبر المدرسة'
                                    onChange={(e) => setSearchSchool(e.target.value)}
                                    value={searchSchool}
                                />
                            </div>

                            <div className='w-1/2'>
                                <select id="" className='block w-full rounded-md p-2 my-2 bg-white dark:bg-gray-900 dark:placeholder:text-gray-300 dark:text-white border-gray-300 shadow-sm",
                        "focus:border-primary focus:ring focus:ring-primary focus:outline-none focus:ring-opacity-50",
                        "placeholder-gray-400",
                        "disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed'
                                    onChange={handleSearch(setSearchCenter)}
                                    value={searchCenter}>

                                    <option value="">
                                        اختر السنتر
                                    </option>

                                    {centers.map((center => (
                                        <option key={center.id} value={center.name}>
                                            {center.name}
                                        </option>
                                    )))}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-1/2">
                                <Input type="text" className='bg-white' placeholder='بحث عبر تليفون الطالب'
                                    onChange={(e) => setSearchPhone(e.target.value)}
                                    value={searchPhone}
                                />
                            </div>

                            <div className="w-1/2">
                                <Input type="text" className='bg-white' placeholder='بحث عبر تليفون ولي الامر'
                                    onChange={(e) => setSearchGuardianPhone(e.target.value)}
                                    value={searchGuardianPhone}
                                />
                            </div>
                        </div>
                    </div>

                    {/* delete search button */}
                    <div className='flex justify-center items-center my-4'>
                        <Button className='sm:w-1/4 w-3/4' onClick={clearSearch}> مسح البحث </Button>
                    </div>
                </div>

                {/* utilities */}
                <div className='utilities'>

                    <div className="flex justify-center items-center my-4">
                        <div className={`mb-2 ${students.length > 1 ? 'flex gap-3' : 'hidden'}`}>
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

                    <div className="container mx-auto text-center flex justify-center items-center">
                        <div>
                            {isSearchActive ? (
                                <span className="bg-black text-white rounded-md py-2 px-3">
                                    عدد الطلاب المبحوث عنها : {students.length}
                                </span>
                            ) : (
                                <span className="bg-black text-white rounded-full py-2 px-3">
                                    عدد الطلاب الكلي : {allStudents.length}
                                </span>
                            )}
                        </div>

                        {selectedRows.length === 0 && (
                            <button
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ml-3"
                                onClick={handleSelectAll}
                            >
                                تحديد الكل
                            </button>
                        )}

                        {selectedRows.length > 0 && (
                            <>
                                <button
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ml-3"
                                    onClick={handleSelectAll}
                                >
                                    تحديد الكل
                                </button>

                                <button
                                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded ml-3"
                                    onClick={handleDeselectAll}
                                >
                                    إلغاء التحديد
                                </button>
                            </>
                        )}
                    </div>

                </div>

                {/* قائمة الطلاب */}
                <div className="w-[420px] mt-10 sm:flex justify-center items-center sm:w-full overflow-x-auto h-full">
                    <table className="border-separate border-spacing-0 min-w-max sm:text-lg rounded-lg text-center">
                        <thead>
                            <tr>
                                <th className="min-w-[80px] p-2 border border-gray-800 bg-primary text-white sticky top-0 z-10">Select</th>

                                <th
                                    className='min-w-[80px] p-2 border border-gray-800 bg-primary text-white sticky top-0 z-10'
                                >
                                    ID
                                </th>

                                <th
                                    className='min-w-[80px] p-2 border border-gray-800  bg-primary text-white sticky top-0 left-0 z-20'
                                >
                                    اسم الطالب
                                </th>

                                <th
                                    className='min-w-[80px] p-2 border border-gray-800 bg-primary text-white sticky top-0 z-10'
                                >
                                    الصف الدراسي
                                </th>

                                <th
                                    className='min-w-[80px] p-2 border border-gray-800 bg-primary text-white sticky top-0 z-10'
                                >
                                    المدرسة
                                </th>

                                <th
                                    className='min-w-[80px] p-2 border border-gray-800  bg-primary text-white sticky top-0 z-10'
                                >
                                    السنتر
                                </th>

                                <th
                                    className='min-w-[80px] p-2 border border-gray-800 bg-primary text-white sticky top-0 z-10'
                                >
                                    تليفون الطالب
                                </th>

                                <th
                                    className='min-w-[80px] p-2 border border-gray-800 bg-primary text-white sticky top-0 z-10'
                                >
                                    تليفون ولي امر الطالب
                                </th>

                                <th
                                    className='min-w-[80px] p-2 border border-gray-800 bg-primary text-white sticky top-0 z-10'
                                >
                                    مجموع الدرجات
                                </th>

                                <th
                                    className='min-w-[80px] p-2 border border-gray-800 bg-primary text-white sticky top-0 z-10'
                                >
                                    القيمة العظمي
                                </th>

                                <th
                                    className='min-w-[80px] p-2 border border-gray-800 bg-primary text-white sticky top-0 z-10'
                                >
                                    النسبة المئوية %
                                </th>

                                {showRanking && <td className='min-w-[80px] p-2 border border-gray-800 bg-primary text-white sticky top-0 z-10'>الترتيب</td>}
                            </tr>
                        </thead>

                        <tbody>
                            {students.map((student, rowIdx) => (
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

                                    <td className="min-w-[80px] p-2 border border-gray-800 bg-primary text-white font-bold"> {student.id} </td>
                                    <td className="min-w-[80px] p-2 border border-gray-800 bg-primary text-white font-bold sticky left-0 bg-gray-100 z-20">
                                        {student.name}
                                    </td>
                                    <td className='min-w-[80px] p-2 border border-gray-800 dark:bg-white' onClick={() => toggleStudentExamScores(student.id)}>
                                        {student.grade === 'grade1' && 'الصف الاول الثانوي'}
                                        {student.grade === 'grade2' && 'الصف الثاني الثانوي'}
                                        {student.grade === 'grade2_specialization_science' && 'الصف الثاني الثانوي علمي'}
                                        {student.grade === 'grade3' && 'الصف الثالث الثانوي'}
                                        {student.grade === 'statistics' && 'احصاء'}
                                    </td>
                                    <td className="min-w-[80px] p-2 border border-gray-800 dark:bg-white">{student.school}</td>
                                    <td className="min-w-[80px] p-2 border border-gray-800 dark:bg-white">{student.center_name}</td>
                                    <td className="min-w-[80px] p-2 border border-gray-800 dark:bg-white">{student.phone_number}</td>
                                    <td className="min-w-[80px] p-2 border border-gray-800 dark:bg-white">{student.guardian_phone_number}</td>
                                    <td className="min-w-[80px] p-2 border border-gray-800 dark:bg-white">{student.total_score}</td>
                                    <td className="min-w-[80px] p-2 border border-gray-800 dark:bg-white">{student.total_max_score}</td>
                                    <td className="min-w-[80px] p-2 border border-gray-800 dark:bg-white">{student.percentage} %</td>

                                    {showRanking && (
                                        <td className="min-w-[80px] p-2 border border-gray-800 dark:bg-white">{student.ranking <= 10 ? student.ranking : ''}</td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-center gap-4 mt-6">
                    <button onClick={exportToExcel} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">تصدير إلى Excel</button>
                </div>
            </section>
        }



    </>
}

export default StudentsDegrees