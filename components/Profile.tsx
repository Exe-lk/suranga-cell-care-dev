import React, { useState, useEffect, FC } from 'react';
import useDarkMode from '../hooks/useDarkMode';
import PaginationButtons, { dataPagination, PER_COUNT } from './PaginationButtons';
import PageWrapper from '../layout/PageWrapper/PageWrapper';
import Icon from './icon/Icon';

import Card, { CardBody, CardHeader, CardLabel, CardTitle } from './bootstrap/Card';
import axios from 'axios';
import { useRouter } from 'next/router';
import Avatar from './Avatar';
import USERS from '../common/data/userDummyData';
import Link from 'next/link';


interface ICommonUpcomingEventsProps {
    isFluid?: boolean;
}


const CommonUpcomingEvents: FC<ICommonUpcomingEventsProps> = ({ isFluid }) => {

    const router = useRouter();
  
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [editModalStatus, setEditModalStatus] = useState<boolean>(false);

    const handleClickEdit = () => {
		setEditModalStatus(true);

	};


    return (
        <PageWrapper>
            {/* Table for displaying customer data */}
            <Card stretch={isFluid} onClick={handleClickEdit}>
               
              
                <CardBody isScrollable={isFluid} className='table-responsive'>
                <div className='row g-4'>
                        <div className='col-12'>
                            <div className='row g-4 align-items-center'>
                                <div className='col-lg-auto'>
                                    {selectedImage ?
                                        <img src={selectedImage} className="mx-auto d-block mb-4"
                                            alt="Selected Profile Picture"
                                            style={{ width: '150px', height: '150px', borderRadius: 70 }}
                                        /> : <Avatar
                                            src={USERS.JOHN.src}
                                            color={USERS.JOHN.color}
                                        />}

                                </div>
                               
                            </div>
                        </div>
                    </div>
                  </CardBody>
            </Card>
           
        </PageWrapper>
    );
};
export default CommonUpcomingEvents;
