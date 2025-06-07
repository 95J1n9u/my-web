import React, { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getRoleDisplayName } from '../utils/permissions';

const UserDebugInfo = ({ user }) => {
  const { isAdmin, userRole } = useAuth(user);

  const [position, setPosition] = useState({ x: 20, y: 20 });
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    dragging.current = true;
    offset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!dragging.current) return;
    setPosition({
      x: e.clientX - offset.current.x,
      y: e.clientY - offset.current.y,
    });
  };

  const handleMouseUp = () => {
    dragging.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div
      className="bg-white border border-gray-300 rounded-lg p-3 shadow-lg z-50 text-xs cursor-move"
      onMouseDown={handleMouseDown}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: '240px',
        userSelect: 'none',
      }}
    >
      <div className="font-bold mb-2">사용자 디버그 정보</div>
      <div>UID: {user?.uid || 'None'}</div>
      <div>Email: {user?.email || 'None'}</div>
      <div>
        Role: {user?.role || 'None'} ({getRoleDisplayName(user?.role)})
      </div>
      <div>Is Admin: {isAdmin() ? 'Yes' : 'No'}</div>
      <div>UserRole Hook: {userRole || 'None'}</div>
      <div className="mt-2 pt-2 border-t">
        <button
          onClick={() => console.log('Current user object:', user)}
          className="text-blue-600 underline"
        >
          Log User Object
        </button>
      </div>
    </div>
  );
};

export default UserDebugInfo;
