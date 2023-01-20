import React from 'react';
import { Profile } from '../lib/types';
import Header from '../components/Header';

type Props = {
  children: React.ReactNode;
  profile?: Profile;
};

const Layout: React.FC<Props> = ({ children, profile }) => (
  <div className="bg-grey-10 flex justify-center">
    <Header profile={profile} />
    {children}
  </div>
);

export default Layout;
