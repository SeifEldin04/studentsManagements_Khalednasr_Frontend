import React, { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../Components/Ui/Card'
import { Link, useNavigate } from 'react-router-dom'
import Input from '../../Components/Ui/Input'
import { Button } from '../../Components/Ui/Button'
import Title from '../../Components/title'
import api from '../../libs/apiCall'
import { BiLoader } from 'react-icons/bi'

const Signup = () => {
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();


  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const resp = await api.post('/users/register', formData);
      if (resp?.data.status === 'success') {
        console.log('User created successfully:', resp?.data);
        navigate('/login');
      }
      setFormErrors({}); // Reset errors on successful submission

    } catch (error) {
      console.error('Error signing up:', error);
        // console.log(error.response.data.message);
        setFormErrors({ general: error.response.data.message || 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section>
      <Title title='Sign-up' />

      <div className='flex items-center justify-center py-10 mt-10'>
        <Card className='sm:w-[500px] w-[350px] bg-white dark:bg-black dark:text-white dark:border-gray-700'>
          <div className='p-6'>
            <CardHeader>
              <CardTitle className='text-center mb-4 dark:text-white'>Create Account</CardTitle>
            </CardHeader>

            {formErrors.general && (
              <p className="text-red-500 text-center mb-4">{formErrors.general}</p>
            )}

            <CardContent className=''>
              <form
                className='w-full m-auto'
                onSubmit={handleSubmit}
              >
                <div className=' flex flex-col'>
                  <Input
                    id="userName"
                    label="User Name"
                    placeholder="Enter username"
                    size="lg"
                    error={formErrors.userName}
                    value={formData.userName}
                    onChange={handleChange}
                  />

                  <Input
                    id="email"
                    label="Email"
                    placeholder="Enter email"
                    size="lg"
                    error={formErrors.email}
                    value={formData.email}
                    onChange={handleChange}
                  />

                  <Input
                    id="password"
                    label="Password"
                    type="password"
                    placeholder="Enter password"
                    size="lg"
                    error={formErrors.password}
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>

                <div className='mt-8 flex items-center justify-center'>
                  <Button
                    variant="default"
                    size="lg"
                    className=""
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? <BiLoader className='text-2xl text-white animate-spin' /> : 'Create Account'}
                  </Button>
                </div>
              </form>
            </CardContent>

            <CardFooter className='text-center text-gray-600 dark:text-gray-200'>
              <p className='m-auto'>
                Already have an account?
                <Link to='/login' className='ml-2'>
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </div>
        </Card>
      </div>
    </section>
  )
}

export default Signup