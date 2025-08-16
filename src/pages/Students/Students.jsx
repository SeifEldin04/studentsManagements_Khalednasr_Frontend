import React, { useEffect, useState } from 'react'
import api from '../../libs/apiCall'
import { IoClose } from 'react-icons/io5';
import Input from '../../Components/Ui/Input';
import { Button } from '../../Components/Ui/Button';
import { PiPlusCircleBold } from 'react-icons/pi';
import { BiLoader } from 'react-icons/bi';
import { MdAdd, MdDelete, MdEdit } from 'react-icons/md';
import Title from '../../Components/title';


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


const Students = () => {
    const [centers, setCenters] = useState([])
    const [students, setStudents] = useState([]);
    const [allStudents, setAllStudents] = useState([]);

    const [studentName, setStudentName] = useState('');
    const [studentGrade, setStudentGrade] = useState('');
    const [studentSchool, setStudentSchool] = useState('');
    const [studentCenter, setStudentCenter] = useState('');
    const [studentAddress, setStudentAddress] = useState('');
    const [studentPhone, setStudentPhone] = useState('');
    const [studentGuardianPhone, setStudentGuardianPhone] = useState('');

    // Related to search student
    const [searchName, setSearchName] = useState('');
    const [searchGrade, setSearchGrade] = useState('');
    const [searchSchool, setSearchSchool] = useState('');
    const [searchPhone, setSearchPhone] = useState('');
    const [searchGuardianPhone, setSearchGuardianPhone] = useState('');
    const [searchCenter, setSearchCenter] = useState('');

    const [showModalAddStudent, setShowModalAddStudent] = useState(false);

    const [editStudent, setEditStudent] = useState(null);
    const [showUpdateForm, setShowUpdateForm] = useState(false);

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('');

    const [selectedRows, setSelectedRows] = useState([]);

    const [sortOrder, setSortOrder] = useState('asc');

    const userToken = localStorage.getItem('khalednasrSiteToken')


    const getCenters = async () => {
        setIsLoading(true);

        // const { data } = await fetchStudents();

        const { data } = await api.get('/centers', {
            headers: { authorization: `Bearer ${userToken}` }
        })

        console.log(data?.data.centers);
        setCenters(data?.data.centers || []);

        setIsLoading(false);
    }

    const getStudents = async () => {
        setIsLoading(true);

        // const { data } = await fetchStudents();

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
        if (selectedRows.length === students.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(students.map(student => student.id));
        }
    };

    const handleDeselectAll = () => {
        setSelectedRows([]);
    };

    const handleDeleteSelected = async () => {
        if (window.confirm(`هل أنت متأكد من حذف ${selectedRows.length} طالب؟`)) {
            try {
                setIsLoading(true);
                // Delete all selected students in one operation
                await Promise.all(selectedRows.map(id => deleteStudent(id)));

                // Update the students list after deletion
                const updatedStudents = students.filter(student => !selectedRows.includes(student.id));
                setStudents(updatedStudents);

                // Clear selection after delete
                setSelectedRows([]);

                // Show success message
                // alert(`تم حذف ${selectedRows.length} طالب بنجاح`);
            } catch (error) {
                console.error('Error deleting students:', error);
                alert('حدث خطأ أثناء حذف الطلاب');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const sortStudentsAlphabetically = () => {
        const sortedStudents = [...students].sort((a, b) => {
            if (sortOrder === 'asc') {
                return a.name.localeCompare(b.name, 'ar');
            } else {
                return b.name.localeCompare(a.name, 'ar');
            }
        });
        setStudents(sortedStudents);
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); // Toggle sort order
    }

    const addStudent = async (studentData) => {
        try {
            setIsLoading(true);

            console.log('Sending new student to server :', studentData);

            await api.post('/students', studentData, {
                headers: {
                    authorization: `Bearer ${userToken}`
                }
            })

            getStudents();
        } catch (err) {
            console.error('حدث خطأ اثناء اضافة الطالب :', error);
        } finally {
            setIsLoading(false);
        }
    }

    const handleStudentEditClick = (student) => {

        const mappedGrade =
            student.grade === 'grade2_specialization_science' ? 'الصف الثاني الثانوي علمي' :
                student.grade === 'grade1' ? 'الصف الاول الثانوي' :
                    student.grade === 'grade2' ? 'الصف الثاني الثانوي' :
                        student.grade === 'grade3' ? 'الصف الثالث الثانوي' :
                            student.grade === 'statistics' ? 'احصاء' : '';

        setShowModalAddStudent(true)

        setStudentName(student.name);
        setStudentGrade(mappedGrade);
        setStudentSchool(student.school);
        setStudentCenter(student.center_id);
        setStudentAddress(student.address);
        setStudentPhone(student.phone_number);
        setStudentGuardianPhone(student.guardian_phone_number);

        setEditStudent(student);
        setShowUpdateForm(true);

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    const updateStudent = async (id, studentData) => {
        try {
            setIsLoading(true);

            console.log('Updating student data :', studentData);

            await api.put(`/students/${id}`, studentData,
                {
                    headers: {
                        authorization: `Bearer ${userToken}`
                    }
                });

            getStudents();

            setIsLoading(false);

            setEditStudent(null);
            setShowUpdateForm(false);
        } catch (error) {
            console.error('Error updating student :', error);
        }
    }

    const deleteStudent = async (id) => {
        // if (window.confirm(`هل انت متأكد من حذف هذا الطالب`)) {
        try {
            setIsLoading(true);

            await api.delete(`/students/${id}`,
                {
                    headers: {
                        authorization: `Bearer ${userToken}`
                    }
                });

            getStudents();

        } catch (error) {
            console.error('Error deleting student :', error);
        } finally {
            setIsLoading(false);
        }
        // }
    }

    // Clear form fields after submission
    const clearFields = () => {
        setStudentName('');
        setStudentCenter('');
        setStudentAddress('');
        setStudentGrade('');
        setStudentPhone('');
        setStudentGuardianPhone('');
        setStudentSchool('');
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!studentName) {
            setError('برجاء ملئ المدخلات المطلوبة');

            // windowd.scrollTo({
            //     top: 0,
            //     behavior: 'smooth'
            // });

            return;
        }

        setError('');

        const selectedCenter = centers.find(center => center.id.toString() === studentCenter.toString());

        if (!selectedCenter && studentCenter) {
            setError('السنتر المحدد غير موجود');
            return;
        }

        // استخدام اسم الصف مباشرةً
        const gradeMapping = {
            'الصف الاول الثانوي': 'grade1',
            'الصف الثاني الثانوي': 'grade2',
            'الصف الثاني الثانوي علمي': 'grade2_specialization_science',
            'الصف الثالث الثانوي': 'grade3',
            'احصاء': 'statistics',
        };

        const studentData = {
            name: studentName,
            grade: gradeMapping[studentGrade] || '', // استخدم القيمة من الmapping أو اتركها فارغة
            school: studentSchool,
            center_id: studentCenter || (selectedCenter ? selectedCenter.id : null),
            center_name: selectedCenter ? selectedCenter.name : null,
            address: studentAddress,
            phone_number: studentPhone,
            guardian_phone_number: studentGuardianPhone
        }

        if (showUpdateForm && editStudent) {
            await updateStudent(editStudent.id, studentData);
        } else {
            await addStudent(studentData);
        }

        clearFields()
        setEditStudent(null);
        setShowUpdateForm(false);

        setShowModalAddStudent(false)
    }

    const toggleShowModalAddStudents = () => setShowModalAddStudent((prev) => !prev);


    return <>
        {isLoading ? <section className='min-h-screen flex justify-center items-center'>
            <BiLoader className='animate-spin w-full text-3xl dark:text-white' />
        </section>

            :

            <section className='sm:p-4'>
                <Title title='Students' />

                {/* مودال إضافة/تعديل طالب */}
                {showModalAddStudent && (
                    <div
                        onClick={() => {
                            toggleShowModalAddStudents();
                            setError('');
                            clearFields();
                        }}
                        className={`fixed inset-0 bg-black bg-opacity-50 z-40`}
                    ></div>
                )}
                <div
                    className={`
                fixed top-0 right-0 h-screen w-5/6 sm:w-1/2 bg-white dark:bg-black shadow-lg z-50
                transform transition-transform duration-300 ease-in-out
                ${showModalAddStudent ? 'translate-x-0' : 'translate-x-full'}
            `}
                >
                    <div className="relative h-full p-6 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <IoClose
                            className="absolute top-3 right-3 bg-red-600 text-white rounded-full text-2xl cursor-pointer"
                            onClick={() => {
                                toggleShowModalAddStudents();
                                setError('');
                                clearFields();
                            }}
                        />

                        {error && (
                            <p className="text-red-500 bg-red-200 w-full sm:w-1/2 sm:m-auto rounded-md text-center my-3">
                                {error}
                            </p>
                        )}

                        <form onSubmit={handleSubmit}>
                            <Input
                                label="اسم الطالب"
                                placeholder="ادخل اسم الطالب"
                                onChange={(e) => setStudentName(e.target.value)}
                                value={studentName}
                            />

                            <div className='text-gray-500'>
                                <label
                                    htmlFor=""
                                    className="block text-md font-medium text-gray-700 dark:text-white"
                                >
                                    الصف
                                </label>
                                <select
                                    type="text"
                                    className='block w-full rounded-md p-2 my-2 bg-gray-100 dark:bg-gray-900 dark:placeholder:text-gray-300 border-gray-300 shadow-sm",
                        "focus:border-primary focus:ring focus:ring-primary focus:outline-none focus:ring-opacity-50",
                        "placeholder-gray-400",
                        "disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed'

                                    id='studentGrade'
                                    onChange={(e) => setStudentGrade(e.target.value)}
                                    value={studentGrade}
                                >

                                    <option value=""> أختر الصف الدراسي</option>

                                    {gradeLevels.map((grade) => (
                                        <option value={grade} key={grade}>
                                            {grade}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className='text-gray-500'>
                                <label
                                    htmlFor=""
                                    className="block text-md font-medium text-gray-700 dark:text-white"
                                >
                                    السنتر
                                </label>
                                <select
                                    type="text"
                                    className='block w-full rounded-md p-2 mt-2 bg-gray-100 dark:bg-gray-900 dark:placeholder:text-gray-300 border-gray-300 shadow-sm",
                        "focus:border-primary focus:ring focus:ring-primary focus:outline-none focus:ring-opacity-50",
                        "placeholder-gray-400",
                        "disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed'

                                    id='studentGrade'
                                    onChange={(e) => setStudentCenter(e.target.value)}
                                    value={studentCenter}
                                >

                                    <option value=""> أختر السنتر</option>

                                    {centers.map((center) => (
                                        <option value={center.id} key={center.id}>
                                            {center.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <Input
                                label="اسم المدرسة"
                                placeholder="ادخل اسم مدرسة الطالب"
                                onChange={(e) => setStudentSchool(e.target.value)}
                                value={studentSchool}
                            />

                            <Input
                                label="المنطقة"
                                placeholder="ادخل اسم منطقة الطالب"
                                onChange={(e) => setStudentAddress(e.target.value)}
                                value={studentAddress}
                            />

                            <Input
                                label="تليفون الطالب"
                                placeholder="ادخل رقم تليفون الطالب"
                                onChange={(e) => setStudentPhone(e.target.value)}
                                value={studentPhone}
                            />

                            <Input
                                label="تليفون ولي امر الطالب"
                                placeholder="ادخل رقم تليفون ولي امر الطالب"
                                onChange={(e) => setStudentGuardianPhone(e.target.value)}
                                value={studentGuardianPhone}
                            />

                            <div className="text-center">
                                <Button size="lg" variant="default" className="w-1/2 my-8" type="submit">
                                    {isLoading ? (
                                        <BiLoader className="text-2xl text-white animate-spin mr-1" />
                                    ) : (
                                        <PiPlusCircleBold className="mr-1" />
                                    )}{' '}
                                    {editStudent ? 'تحديث الطالب' : 'إضافة الطالب'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* فتح مودال إضافة الطالب والبحث*/}
                <div className='ml-2 sm:w-1/6 w-full my-2 flex justify-start items-center'>
                    <Button onClick={toggleShowModalAddStudents}>
                        <PiPlusCircleBold className='mr-1' /> اضافة طالب
                    </Button>
                </div>


                {/* utilities */}
                {students.length > 0 ?

                    <>

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
                            <div className='my-3 w-full flex justify-center items-center'>
                                <Button className='sm:w-1/4 w-3/4' onClick={handleSelectAll}>   تحديد الكل </Button>
                            </div>

                            <div className={`sortBtn w-full flex justify-center items-center`}>
                                <Button className='btn btn-success m-auto sm:w-1/4 w-3/4' onClick={sortStudentsAlphabetically}>
                                    ترتيب أبجدي حسب الأسم {sortOrder === 'asc' ? '(تصاعدي)' : '(تنازلي)'}
                                </Button>
                            </div>

                            {selectedRows.length > 0 && <div className="my-4 sm:w-1/2 w-3/4 py-4 m-auto bg-white dark:bg-gray-900 rounded-lg shadow-md">
                                <div className='w-full flex justify-center items-center'>
                                    <Button className='bg-red-600 hover:bg-red-700' onClick={handleDeselectAll}> الغاء التحديد </Button>
                                </div>

                                <div className='mt-3 w-full flex justify-center items-center'>
                                    <Button className='bg-red-600 hover:bg-red-700' onClick={handleDeleteSelected}> حذف الطلاب المحددين </Button>
                                </div>
                            </div>
                            }
                        </div>

                        {/* قائمة الطلاب */}
                        <div className="w-[420px] mt-10 sm:flex justify-center items-center sm:w-full overflow-x-auto h-full">
                            <table className="border-separate border-spacing-0 min-w-max sm:text-lg rounded-lg text-center">
                                <thead>
                                    <tr>
                                        <th className='min-w-[80px] p-2 border border-gray-800 bg-primary text-white sticky top-0 z-10'> Select </th>
                                        <th className='min-w-[80px] p-2 border border-gray-800 bg-primary text-white sticky top-0 z-10'> ID </th>
                                        <th className='min-w-[80px] p-2 border border-gray-800  bg-primary text-white sticky top-0 left-0 z-20'> اسم الطالب </th>
                                        <th className='min-w-[80px] p-2 border border-gray-800 bg-primary text-white sticky top-0 z-10'> الصف الدراسي </th>
                                        <th className='min-w-[80px] p-2 border border-gray-800 bg-primary text-white sticky top-0 z-10'> المدرسة </th>
                                        <th className='min-w-[80px] p-2 border border-gray-800  bg-primary text-white sticky top-0 z-10'> السنتر </th>
                                        <th className='min-w-[80px] p-2 border border-gray-800 bg-primary text-white sticky top-0 z-10'> المنطقة </th>
                                        <th className='min-w-[80px] p-2 border border-gray-800 bg-primary text-white sticky top-0 z-10'> تليفون الطالب </th>
                                        <th className='min-w-[80px] p-2 border border-gray-800 bg-primary text-white sticky top-0 z-10'> تليفون ولي امر الطالب </th>
                                        <th className='min-w-[80px] p-2 border border-gray-800 bg-primary text-white sticky top-0 z-10'> عمليات </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {students.map((student, rowIdx) => (
                                        <tr key={rowIdx} className={`${selectedRows.includes(student.id) ? 'bg-gray-400' : ''}`}>
                                            <td
                                                className="min-w-[80px] p-2 border border-gray-800 dark:bg-white text-white font-bold cursor-pointer"
                                                onClick={(e) => handleSelectRow(e, student.id)}
                                            >
                                                <div className="d-flex justify-content-center">
                                                    <div
                                                        className={`select ${selectedRows.includes(student.id) ? 'selected' : ''}`}
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
                                            <td className="min-w-[80px] p-2 border border-gray-800 dark:bg-white">{student.address}</td>
                                            <td className="min-w-[80px] p-2 border border-gray-800 dark:bg-white">{student.phone_number}</td>
                                            <td className="min-w-[80px] p-2 border border-gray-800 dark:bg-white">{student.guardian_phone_number}</td>

                                            <td className="min-w-[80px] p-2 border border-gray-800 dark:bg-white">
                                                <button
                                                    className="bg-transparent text-yellow-400 hover:text-yellow-500 text-sm mr-2"
                                                    onClick={() => handleStudentEditClick(student)}
                                                >
                                                    <MdEdit className="inline-block mr-1 text-2xl" />
                                                </button>
                                                <button
                                                    className="text-red-600 hover:text-red-700 text-sm"
                                                    onClick={() => deleteStudent(student.id)}
                                                >
                                                    <MdDelete className="inline-block mr-1 text-2xl" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>

                    :

                    <p className="text-red-500 text-center my-3 text-xl"> لا يوجد طلاب متاحين </p>}
            </section>
        }



    </>
}

export default Students