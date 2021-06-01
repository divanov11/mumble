import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useDetectClickOutside } from 'react-detect-click-outside';
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames';

import '../styles/components/HeaderBar.css';
import logo from '../assets/logo/dark-logo.png';

import { Avatar } from '../common';
import SearchBox from './SearchBox';
import { logout } from '../actions/authActions';
import { toggleTheme as DarkLightTheme } from '../actions/local';
import { markAsRead } from '../actions/notificationsActions';

export const getNotificationLink = (notification) => {
  const notificationUrlMap = {
    mumble: `/profile/${notification.created_by.username}`,
    discussion: `/discussion/${notification.content_id}`,
    follow: `/profile/${notification.created_by.username}`,
    article: `/article/${notification.content_id}`,
  };
  return notificationUrlMap[notification.notification_type];
};

const Header = ({ isSidebarNav, toggleSidebarNav }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const isDarkTheme = useSelector((state) => state.local.darkTheme);
  const { notifications } = useSelector((state) => state.unreadNotifications);
  const toggleTheme = useDispatch();

  const auth = useSelector((state) => state.auth);
  const { user } = auth;
  //const user = usersData.find((u) => Number(u.id) === 1);
  const [showNavigation, setShowNavigation] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const logoutUser = () => {
    dispatch(logout());
    history.push('/login');
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setShowNotification(false); // if the notification dropdown is open then close it
    setShowNavigation(!showNavigation);
  };

  const toggleNotification = (e) => {
    e.stopPropagation();
    setShowNavigation(false); // if the avator dropdown is open then close it
    setShowNotification(!showNotification);
  };

  const closeDropdown = () => setShowNavigation(false);
  const closeNotification = () => setShowNotification(false);
  
  const toggleLogoutMessage = (e) => {
    setShowComponent(true); 
    setShowComponent(!showNotification);
  };
  const navigationRef = useDetectClickOutside({
    onTriggered: closeDropdown,
  });

  const notificationRef = useDetectClickOutside({
    onTriggered: closeNotification,
  });

  const hasUnreadNotification = () => !!notifications.find((notification) => !notification.is_read);

  let [showComponent, setShowComponent] = useState(false);

  // functin for removing the message after pressing cancel
  const handleClick = () => setShowComponent(!showComponent);

  // function for removing the confirmation message  after 30 second of buttonclick on logout
  const showMessage = () => {
    setShowComponent(true);
    setTimeout(() => {
      setShowComponent(false);
    }, 30000);
  };

  return (
    <>
      <div className="header">
        <div className="container">
          <div className="header__logo">
            <button className="header__menubar" onClick={toggleSidebarNav}>
              <i className={`fas fa-${!isSidebarNav ? 'bars' : 'times'}`}></i>
            </button>
            <Link to={'/'}>
              <img src={logo} alt="Mumble Icon" />
            </Link>
          </div>

          <div className="header__nav">
            <SearchBox />
            <i
              className={classNames('fas', 'fa-bell', 'nav-item', 'nav-icon')}
              onClick={toggleNotification}
            >
              {hasUnreadNotification() && <div className="nav-icon--unread"></div>}
            </i>
            {!user.profile ? (
              <Avatar
              id="nav-toggle-icon"
                onClick={toggleDropdown}
                alt="img-description"
                className="nav-item"
                size="sm"
                />
            ) : (
              <Avatar
                id="nav-toggle-icon"
                onClick={toggleDropdown}
                alt="img-description"
                src={user.profile.profile_pic}
                className="nav-item"
                size="sm"
              />
            )}
          </div>

          {showNavigation && (
            <div ref={navigationRef} className="card" id="user--navigation">
              <div
                role="button"
                className="user-navigation--item"
                onClick={() => {
                  toggleTheme(DarkLightTheme());
                  closeDropdown();
                }}
                >
                <i
                  className={classNames(
                    'fas',
                    `fa-${isDarkTheme ? 'sun' : 'moon'}`,
                    ' user--nav--icon',
                  )}
                  ></i>
                Enable {isDarkTheme ? 'light' : 'dark'} Mode
              </div>

              <Link
                to={`/profile/${user.username}`}
                className="user-navigation--item"
                onClick={closeDropdown}
              >
                <i className="fas fa-user user--nav--icon"></i>
                Profile
              </Link>

              <Link
                to="/settings"
                id="user-settings"
                className="user-navigation--item"
                onClick={closeDropdown}
              >
                <i className="fas fa-cog user--nav--icon"></i>
                Settings
              </Link>

              <div role="button" className="user-navigation--item" onClick={showMessage}>
                <i className="fas fa-sign-out-alt user--nav--icon"></i>
                {' Logout '}
              </div>
            </div>
          )}
          {showNotification && (
            <div ref={notificationRef} className="card" id="user--navigation">
              <Link
                to={`/notifications`}
                className="user-navigation--item"
                onClick={closeNotification}
                >
                <i className="fas fa-envelope-open-text nav--icon"></i>
                <h6>All Notifications</h6>
              </Link>

              {notifications
                .filter((notification) => !notification.is_read)
                .map((notification) => (
                  <div key={notification.id} className="user-navigation--item">
                    <Avatar
                      alt="img-description"
                      src={notification.created_by.profile_pic}
                      className="nav-avatar"
                      size="sm"
                    />
                    <Link
                      to={getNotificationLink(notification)}
                      onClick={() => {
                        closeNotification();
                        dispatch(markAsRead(notification.id));
                      }}
                    >
                      {notification.content}
                    </Link>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
          {/* showing the logout confirmation message */}
          {showComponent && (
            <div className="logoutConfirmation">
              <h5 className="cdlogoutConfirmation__message">Do you really want to log out?</h5>
              <div className="button">
              <button onClick={handleClick} className="logoutConfirmation__cancelbtn">
                cancel
              </button>
              <button onClick={logoutUser} className="logoutConfirmation__logoutbtn">
                Logout
              </button>
              </div>
            </div>
          )}
    </>
  );
};

export default Header;