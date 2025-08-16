import React from 'react'

const Title = ({ title }) => {
    return (
        <p className='title text-2xl 2xl:text-3xl font-bold ml-6 my-6 text-black dark:text-white border-b-2 border-primary w-fit pb-2'>
            {title}
        </p>
    )
}

export default Title