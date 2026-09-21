import React from 'react';
import { Services, ServicesProps } from './Services';

export type DFYServicesProps = ServicesProps;

export const DFYServices: React.FC<DFYServicesProps> = (props) => {
  return <Services {...props} />;
};

export default DFYServices;
