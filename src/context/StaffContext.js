import React, { createContext, useContext, useState } from 'react';

const StaffContext = createContext(null);

const INITIAL_STAFF = {
  name: 'Trần Thị Thu',
  phone: '0912 333 444',
  avatar: '👩‍💼',
  gender: 'female',
  photoUri: null,
};

export function StaffProvider({ children }) {
  const [staff, setStaff] = useState(INITIAL_STAFF);
  const updateStaff = updated => setStaff(prev => ({ ...prev, ...updated }));
  return (
    <StaffContext.Provider value={{ staff, updateStaff }}>
      {children}
    </StaffContext.Provider>
  );
}

export function useStaff() {
  return useContext(StaffContext);
}
