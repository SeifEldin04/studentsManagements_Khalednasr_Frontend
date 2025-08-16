import React, { useState, useEffect } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { PiPlusCircleBold } from "react-icons/pi";
import { IoClose } from "react-icons/io5";
import Title from '../../Components/title';
import { Button } from '../../Components/Ui/Button';
import Input from '../../Components/Ui/Input';
import { BiLoader } from 'react-icons/bi';
import { MdDelete, MdEdit } from "react-icons/md";
import api from '../../libs/apiCall';


// تعريف مستويات الصفوف (grades)
const gradeLevels = [
    'الصف الاول الثانوي',
    'الصف الثاني الثانوي',
    'الصف الثاني الثانوي علمي',
    'الصف الثالث الثانوي',
    'احصاء'
];

// دالة مساعدة لتحويل اسم الصف إلى مفتاح الحقل في السنتر
const getGradeField = (grade) => {
    switch (grade) {
        case 'الصف الاول الثانوي':
            return 'grade1';
        case 'الصف الثاني الثانوي':
            return 'grade2';
        case 'الصف الثاني الثانوي علمي':
            return 'grade2_specialization_science';
        case 'الصف الثالث الثانوي':
            return 'grade3';
        case 'احصاء':
            return 'statistics';
        default:
            return '';
    }
};

const Centers = () => {
    // حالة تحميل البيانات والأخطاء العامة
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // بيانات السنتر والحصص
    const [allCenters, setAllCenters] = useState([]);
    const [centers, setCenters] = useState([]);
    const [centerSchedules, setCenterSchedules] = useState([]);

    // حالات المودالات لإضافة/تعديل السنتر والحصص
    const [showModalAddCenter, setShowModalAddCenter] = useState(false);
    const [showModalAddSchedule, setShowModalAddSchedule] = useState(false);

    // حقول نموذج السنتر
    const [centerName, setCenterName] = useState('');
    const [selectedGrades, setSelectedGrades] = useState([]);
    const [editCenter, setEditCenter] = useState(null);
    const [showUpdateForm, setShowUpdateForm] = useState(false);

    // حقول نموذج الحصة (المادة، اليوم، الساعة)
    const [sessionData, setSessionData] = useState({ day: '', time: '', subject: '' });
    const [sessionFormCenterGrade, setSessionFormCenterGrade] = useState({ centerId: null, grade: null });
    const [editCenterSchedule, setEditCenterSchedule] = useState(null);

    // لتوسيع وإخفاء الجداول الخاصة بكل صف داخل السنتر
    const [openGrades, setOpenGrades] = useState({});

    const [searchTerm, setSearchTerm] = useState('');


    // الحصول على التوكن من localStorage (يمكن تحويله لـ Context لاحقاً)
    const userToken = localStorage.getItem('khalednasrSiteToken');


    const getCenters = async () => {
        try {
            setIsLoading(true);

            const { data } = await api.get('/centers', {
                headers: { authorization: `Bearer ${userToken}` }
            });
            setAllCenters(data.data.centers || []);
            setCenters(data.data.centers || []);
            // console.log(data);

        } catch (err) {
            console.error('Error fetching centers:', err);
            setError('حدث خطأ في جلب السناتر');
            setIsLoading(false);
        }
        finally {
            setIsLoading(false);
        }
    };

    const getCenterSchedules = async () => {
        try {
            setIsLoading(true);

            const { data } = await api.get('/center_schedules', {
                headers: { authorization: `Bearer ${userToken}` }
            });
            setCenterSchedules(data.data.centerSchedules || []);
            // console.log(data);

        } catch (err) {
            console.error('Error fetching center schedules:', err);
            setError('حدث خطأ في جلب الحصص');
        }
        finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getCenters();
        getCenterSchedules();
    }, []);

    // Handle search
    useEffect(() => {
        const filtered = allCenters.filter(center =>
            center.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setCenters(filtered);
    }, [searchTerm, allCenters]);

    // وظائف السنتر (الإضافة والتعديل والحذف)
    const addCenter = async (centerData) => {
        try {
            setIsLoading(true);
            await api.post('/centers', centerData, {
                headers: { authorization: `Bearer ${userToken}` }
            });
            await getCenters();

        } catch (err) {
            console.error('Error adding center:', err);
            setError('حدث خطأ أثناء إنشاء السنتر');
        }
        finally {
            setIsLoading(false);
        }
    };

    const updateCenter = async (id, centerData) => {
        try {
            setIsLoading(true);
            await api.put(`/centers/${id}`, centerData, {
                headers: { authorization: `Bearer ${userToken}` }
            });
            await getCenters();
            setShowUpdateForm(false);
            setEditCenter(null);

        } catch (err) {
            console.error('Error updating center:', err);
            setError('حدث خطأ أثناء تعديل السنتر');
            setIsLoading(false);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteCenter = async (id) => {
        if (window.confirm('هل أنت متأكد من حذف هذا السنتر؟')) {
            try {
                setIsLoading(true);
                await api.delete(`/centers/${id}`, {
                    headers: { authorization: `Bearer ${userToken}` }
                });
                await getCenters();

            } catch (err) {
                console.error('Error deleting center:', err);
                setError('حدث خطأ أثناء حذف السنتر');
                setIsLoading(false);
            } finally {
                setIsLoading(false);
            }
        }
    };

    // التعامل مع اختيار الصفوف في نموذج السنتر
    const handleGradeChange = (e) => {
        const value = e.target.value;
        setSelectedGrades((prev) =>
            prev.includes(value) ? prev.filter((grade) => grade !== value) : [...prev, value]
        );
    };

    const handleCenterFormSubmit = async (e) => {
        e.preventDefault();
        // تحقق بسيط
        if (!centerName || selectedGrades.length === 0) {
            setError('برجاء ملء كل المدخلات المطلوبة');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        setError('');

        const centerData = {
            name: centerName,
            grade1: selectedGrades.includes('الصف الاول الثانوي'),
            grade2: selectedGrades.includes('الصف الثاني الثانوي'),
            grade2_specialization_science: selectedGrades.includes('الصف الثاني الثانوي علمي'),
            grade3: selectedGrades.includes('الصف الثالث الثانوي'),
            statistics: selectedGrades.includes('احصاء')
        };

        if (showUpdateForm && editCenter) {
            await updateCenter(editCenter.id, centerData);
        } else {
            await addCenter(centerData);
        }

        // إعادة تعيين الحقول
        setCenterName('');
        setSelectedGrades([]);
        setShowUpdateForm(false);
        setEditCenter(null);
        setShowModalAddCenter(false);
    };

    // التعامل مع تعديل السنتر (يملأ النموذج الحالي)
    const handleCenterEditClick = (center) => {
        setCenterName(center.name);
        setSelectedGrades([
            center.grade1 && 'الصف الاول الثانوي',
            center.grade2 && 'الصف الثاني الثانوي',
            center.grade2_specialization_science && 'الصف الثاني الثانوي علمي',
            center.grade3 && 'الصف الثالث الثانوي',
            center.statistics && 'احصاء'
        ].filter(Boolean));
        setEditCenter(center);
        setShowUpdateForm(true);
        setShowModalAddCenter(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // وظائف الحصص (الإضافة والتعديل والحذف)
    const addCenterSchedule = async (scheduleData) => {
        try {
            setIsLoading(true);

            const { data } = await api.post('/center_schedules', scheduleData, {
                headers: { authorization: `Bearer ${userToken}` }
            });
            if (data.status === 'success') {
                await getCenterSchedules();
                await getCenters();
            }

        } catch (err) {
            console.error('Error adding center schedule:', err);
            setError('حدث خطأ أثناء إضافة الحصة');
            setIsLoading(false);
        } finally {
            setIsLoading(false);
        }
    };

    const updateCenterSchedule = async (id, scheduleData) => {
        try {
            setIsLoading(true);

            await api.put(`/center_schedules/${id}`, scheduleData, {
                headers: { authorization: `Bearer ${userToken}` }
            });
            await getCenterSchedules();
            await getCenters();
            setEditCenterSchedule(null);
            setShowModalAddSchedule(false);

        } catch (err) {
            console.error('Error updating center schedule:', err);
            setError('حدث خطأ أثناء تعديل الحصة');
            setIsLoading(false);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteCenterSchedule = async (id) => {
        if (window.confirm('هل أنت متأكد من حذف هذا الميعاد؟')) {
            try {
                setIsLoading(true);

                await api.delete(`/center_schedules/${id}`, {
                    headers: { authorization: `Bearer ${userToken}` }
                });
                await getCenterSchedules();
                await getCenters();

            } catch (err) {
                console.error('Error deleting center schedule:', err);
                setError('حدث خطأ أثناء حذف الحصة');
                setIsLoading(false);
            } finally {
                setIsLoading(false);
            }
        }
    };

    // التعامل مع نموذج الحصة
    const handleSessionInputChange = (e) => {
        const { name, value } = e.target;
        setSessionData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSessionFormSubmit = async () => {
        if (!sessionData.day || !sessionData.time || !sessionData.subject) {
            setError('برجاء ملء مدخلات الحصة');
            return;
        }
        setError('');
        const scheduleData = {
            center_id: sessionFormCenterGrade.centerId,
            grade: sessionFormCenterGrade.grade,
            day_of_week: sessionData.day,
            time: sessionData.time,
            subject: sessionData.subject,
        };
        if (editCenterSchedule) {
            await updateCenterSchedule(editCenterSchedule.id, scheduleData);
        } else {
            await addCenterSchedule(scheduleData);
        }
        setShowModalAddSchedule(false);
        setSessionData({ day: '', time: '', subject: '' });
    };

    // فتح/إغلاق مودالات الإضافة
    const toggleShowModalAddCenter = () => setShowModalAddCenter((prev) => !prev);
    const toggleShowModalAddSchedule = () => setShowModalAddSchedule((prev) => !prev);

    // فتح النموذج الخاص بالحصة مع تحديد السنتر والصف
    const handleCenterScheduleEditClick = (session) => {
        setSessionData({
            day: session.day_of_week,
            time: session.time,
            subject: session.subject,
        });
        setSessionFormCenterGrade({ centerId: session.center_id, grade: session.grade });
        setEditCenterSchedule(session);
        setShowModalAddSchedule(true);
    };

    // لتصفية الحصص الخاصة بسنتر وصف معين
    const getSessionsForCenterAndGrade = (centerId, grade) => {
        return centerSchedules.filter(session => session.center_id === centerId && session.grade === grade);
    };

    const toggleGrade = (centerId, gradeName) => {
        const key = `${centerId}-${gradeName}`;
        setOpenGrades(prev => ({ ...prev, [key]: !prev[key] }));
    };


    return <>
        {isLoading ? <section className='min-h-screen flex justify-center items-center'>
            < BiLoader className='animate-spin w-full text-3xl dark:text-white' />
        </section >

            :

            <section className="sm:p-4">
                <Title title="Centers" />

                {/* مودال إضافة/تعديل السنتر */}
                <div
                    onClick={() => {
                        toggleShowModalAddCenter();
                        setError('');
                    }}
                    className={`
          fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4
          transition-opacity duration-300 ease-in-out
          ${showModalAddCenter ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className={`
            w-full max-w-2xl dark:border dark:border-gray-700 bg-white dark:bg-black rounded-lg shadow-md p-6 relative
            transform transition-transform duration-300 ease-in-out
            ${showModalAddCenter ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
          `}
                    >
                        <IoClose
                            className="absolute top-3 text-red-600 right-3 text-2xl cursor-pointer"
                            onClick={() => {
                                toggleShowModalAddCenter();
                                setError('');
                            }}
                        />

                        {error && (
                            <p className="text-red-500 bg-red-200 w-full sm:w-1/2 sm:m-auto rounded-md text-center my-3">{error}</p>
                        )}

                        <form onSubmit={handleCenterFormSubmit}>
                            <Input
                                label="اسم السنتر"
                                placeholder="ادخل اسم السنتر"
                                value={centerName}
                                onChange={(e) => setCenterName(e.target.value)}
                            />
                            <div className="mt-6 space-y-3 dark:text-white">
                                {gradeLevels.map((grade) => (
                                    <div key={grade} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id={grade}
                                            value={grade}
                                            checked={selectedGrades.includes(grade)}
                                            onChange={handleGradeChange}
                                            className="form-check-input"
                                        />
                                        <label htmlFor={grade} className="form-check-label">{grade}</label>
                                    </div>
                                ))}
                            </div>
                            <div className="text-center">
                                <Button size="lg" variant="default" className="w-1/2 my-8" type="submit">
                                    {isLoading ? <BiLoader className='text-2xl text-white animate-spin mr-1' /> : <PiPlusCircleBold className='mr-1' />} {editCenter ? 'تحديث السنتر' : 'إضافة السنتر'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* مودال إضافة/تعديل الحصة */}
                <div
                    onClick={toggleShowModalAddSchedule}
                    className={`
          fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4
          transition-opacity duration-300 ease-in-out
          ${showModalAddSchedule ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className={`
            w-full max-w-2xl dark:border dark:border-gray-700 bg-white dark:bg-black rounded-lg shadow-md p-6 relative
            transform transition-transform duration-300 ease-in-out
            ${showModalAddSchedule ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
          `}
                    >
                        <IoClose
                            className="absolute top-3 text-red-600 right-3 text-2xl cursor-pointer"
                            onClick={() => {
                                toggleShowModalAddSchedule();
                                setError('');
                            }}
                        />
                        <p className="title text-2xl font-bold ml-6 my-4 text-black dark:text-white border-b-2 border-primary w-fit pb-2">
                            {editCenterSchedule ? 'تعديل ميعاد الحصة لل' : 'اضافة ميعاد حصة لل'} <span className="text-primary">{sessionFormCenterGrade.grade}</span>
                        </p>

                        {error && (
                            <p className="text-red-500 bg-red-200 w-full sm:w-1/2 sm:m-auto rounded-md text-center my-3">{error}</p>
                        )}

                        <div className="space-y-3">
                            <Input
                                label="اليوم"
                                placeholder="ادخل اليوم"
                                value={sessionData.day}
                                onChange={handleSessionInputChange}
                                name="day"
                            />
                            <Input
                                label="الساعة"
                                placeholder="ادخل الساعة"
                                value={sessionData.time}
                                onChange={handleSessionInputChange}
                                name="time"
                            />
                            <Input
                                label="المادة"
                                placeholder="ادخل المادة"
                                value={sessionData.subject}
                                onChange={handleSessionInputChange}
                                name="subject"
                            />
                        </div>
                        <div className="text-center">
                            <Button size="lg" variant="default" className="w-1/2 my-8" onClick={handleSessionFormSubmit}>
                                {isLoading ? <BiLoader className='text-2xl text-white animate-spin mr-1' /> : <PiPlusCircleBold className='mr-1' />} {editCenterSchedule ? 'تحديث الحصة' : 'إضافة حصة'}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* شريط البحث وزر فتح مودال إضافة السنتر */}
                <div className={`sm:flex ${centers.length > 0 ? '' : 'justify-start w-1/4'} sm:items-center w-full mb-6 gap-2`}>
                    {centers.length > 0 ? <div className="sm:w-2/3">
                        <Input
                            placeholder="ادخل اسم السنتر للبحث"
                            className="bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />

                    </div>
                        :
                        ''}
                    <div className={`${centers.length > 0 ? 'sm:w-1/4' : 'sm:w-1/2'}  w-1/2 m-auto mt-2`}>
                        <Button
                            variant="default"
                            size="lg"
                            className="gap-2 w-full"
                            onClick={toggleShowModalAddCenter}
                        >
                            <PiPlusCircleBold /> اضافة سنتر
                        </Button>
                    </div>
                </div>

                {/* قائمة السنتر */}
                <div className={`${centers.length > 0 ? 'grid' : ''} lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6 items-start`}>

                    {centers.length > 0 ? centers.map((center, index) => (
                        <div key={index} className="card my-3 bg-white dark:bg-gray-900 text-black dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div className="centerInfo p-3 flex justify-between items-center">
                                {/* <h2 className="text-lg font-bold">{center.name}</h2> */}

                                <Title className="" title={center.name} />

                                <div>
                                    <button
                                        className="bg-transparent text-yellow-400 hover:text-yellow-500 text-sm mr-2"
                                        onClick={() => handleCenterEditClick(center)}
                                    >
                                        <MdEdit className="inline-block mr-1 text-2xl" />
                                    </button>
                                    <button
                                        className="text-red-600 hover:text-red-700 text-sm"
                                        onClick={() => deleteCenter(center.id)}
                                    >
                                        <MdDelete className="inline-block mr-1 text-2xl" />
                                    </button>
                                </div>
                            </div>

                            <div className="centerSchedules mt-6">
                                {gradeLevels.map((grade, idx) => (
                                    center[getGradeField(grade)] && (
                                        <div key={idx} className="grade border-t">
                                            <div
                                                className="p-3 flex justify-between items-center border-b cursor-pointer"
                                                onClick={() => toggleGrade(center.id, grade)}
                                            >
                                                <span className="rounded-sm p-1 px-2">{grade}</span>
                                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                                    {openGrades[`${center.id}-${grade}`] ? <FaChevronUp /> : <FaChevronDown />}
                                                </span>
                                            </div>
                                            <div className="p-3">
                                                <Button
                                                    variant="default"
                                                    size="lg"
                                                    className="w-full gap-2"
                                                    onClick={() => {
                                                        // نفتح مودال إضافة الحصة مع تمرير السنتر والصف
                                                        setSessionFormCenterGrade({ centerId: center.id, grade: grade });
                                                        setShowModalAddSchedule(true);
                                                    }}
                                                >
                                                    {isLoading ? <BiLoader /> : <PiPlusCircleBold />} اضافة حصة
                                                </Button>
                                            </div>

                                            {openGrades[`${center.id}-${grade}`] && (
                                                <div className="px-3 pb-3">
                                                    <table className="w-full mt-2 text-md">
                                                        <thead>
                                                            <tr className="text-left border-b border-gray-300 dark:border-gray-700">
                                                                <th className="py-1">اليوم</th>
                                                                <th className="py-1">الساعة</th>
                                                                <th className="py-1">المادة</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {getSessionsForCenterAndGrade(center.id, grade).length > 0 ? (
                                                                getSessionsForCenterAndGrade(center.id, grade).map((session, i) => (
                                                                    <tr key={i} className="border-b border-gray-100 dark:border-gray-700">
                                                                        <td className="py-1">{session.day_of_week}</td>
                                                                        <td className="py-1">{session.time}</td>
                                                                        <td className="py-1">{session.subject}</td>
                                                                        <td className="py-1 flex justify-end">
                                                                            <button
                                                                                className="text-yellow-400 hover:text-yellow-500 text-sm mr-2"
                                                                                onClick={() => handleCenterScheduleEditClick(session)}
                                                                            >
                                                                                <MdEdit className="inline-block mr-1 text-2xl" />
                                                                            </button>
                                                                            <button
                                                                                className="text-red-600 hover:text-red-700 text-sm"
                                                                                onClick={() => deleteCenterSchedule(session.id)}
                                                                            >
                                                                                <MdDelete className="inline-block mr-1 text-2xl" />
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            ) : (
                                                                <tr>
                                                                    <td colSpan="4" className="text-gray-500 py-2 italic">
                                                                        No lessons added yet.
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>
                    )) : (
                        <p className="text-red-500 text-center my-3 text-xl"> لا يوجد  سناتر متاحة</p>
                    )}
                </div>
            </section>}

    </>
};

export default Centers;
