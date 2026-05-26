import React, { createContext, useContext, useState } from 'react';

export const ANNOUNCEMENTS = [
  {
    id: '1', icon: '⚡', type: 'warning',
    title: 'Cắt điện bảo trì tầng 2',
    time:  'Ngày mai 8:00 – 12:00',
    date:  '26/04/2026',
    from:  '08:00', to: '12:00',
    detail: 'Ban quản lý thông báo sẽ tiến hành cắt điện toàn bộ tầng 2 để bảo trì hệ thống điện định kỳ. Trong thời gian này, cư dân tầng 2 vui lòng chủ động sạc đầy thiết bị điện tử và dự trữ nước uống trước khi cắt điện. Xin lỗi vì sự bất tiện này.',
    postedBy: 'Ban quản lý Green Home',
    postedAt: '07:30 25/04/2026',
  },
  {
    id: '2', icon: '🧹', type: 'info',
    title: 'Vệ sinh khu vực chung',
    time:  'Thứ 7, 14:00 – 17:00',
    date:  '14/04/2026',
    from:  '14:00', to: '17:00',
    detail: 'Ban quản lý sẽ tổ chức tổng vệ sinh khu vực hành lang, cầu thang và sân chung vào chiều thứ 7. Cư dân vui lòng không để xe hoặc đồ đạc cá nhân tại hành lang trong khung giờ này để đội vệ sinh có thể làm việc thuận tiện.',
    postedBy: 'Trần Thị Thu – Nhân viên quản lý',
    postedAt: '09:00 12/04/2026',
  },
];

const NotificationsContext = createContext();

export function NotificationsProvider({ children }) {
  const [readIds, setReadIds] = useState([]);

  const markRead    = (id) => setReadIds(prev => prev.includes(id) ? prev : [...prev, id]);
  const markAllRead = ()   => setReadIds(ANNOUNCEMENTS.map(a => a.id));
  const unreadCount = ANNOUNCEMENTS.filter(a => !readIds.includes(a.id)).length;

  return (
    <NotificationsContext.Provider value={{ announcements: ANNOUNCEMENTS, readIds, markRead, markAllRead, unreadCount }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationsContext);
}
