import React from 'react';
import PropTypes from "prop-types";

Loading.propTypes = {
    message: PropTypes.string,
};

export default function Loading(props: { message?: string }) {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <div
                className="w-16 h-16 border-4 border-t-[#275559] border-gray-300 rounded-full animate-spin "
            ></div>
            <div className='flex flex-col mt-2 items-center justify-center text-gray-400'>
                <div>{props.message}</div>
                <div>Please wait...</div>
            </div>
        </div>
    );
}
