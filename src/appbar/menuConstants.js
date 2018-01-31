const menuObject = {
  primaryMenu: [
    {
      name: 'Overview',
      link: '/',
      key: 'o',
      classes: 'header__menu-item header__menu-item--overview',
    },
    {
      name: 'Dashboard',
      link: '/d',
      key: 'd',
      classes: 'header__menu-item header__menu-item--dashboard',
    },
    {
      name: 'Logs',
      link: '/l',
      key: 'l',
      classes: 'header__menu-item header__menu-item--logs',
    },
    {
      name: 'Events',
      link: '/e',
      key: 'e',
      classes: 'header__menu-item header__menu-item--events',
    },
  ],
  rightMenu: [
    {
      name: 'Profile',
      link: false,
      hasChildren: true,
      key: 'pc',
      classes: 'header__menu-item header__menu-item--profile',
      children: [
        {
          name: 'My Profile',
          link: '/p',
          hasChildren: false,
          key: 'p',
          classes: 'header__menu-item header__menu-item--profile',
        },
        {
          name: 'Account',
          link: '/a',
          hasChildren: false,
          key: 'a',
          classes: 'header__menu-item header__menu-item--account',
        },
        {
          name: 'Log out',
          link: false,
          hasChildren: false,
          lo: true,
          key: 'lo',
          classes: 'header__menu-item header__menu-item--account',
        },
      ],
    },
  ],
};

export default menuObject;
