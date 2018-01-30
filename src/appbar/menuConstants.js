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
      link: '#',
      hasChildren: true,
      key: 'pc',
      classes: 'header__menu-item header__menu-item--profile',
      children: [
        {
          name: 'Profile',
          link: '/p',
          hasChildren: true,
          key: 'p',
        },
        {
          name: 'Account',
          link: '/p',
          hasChildren: true,
          key: 'p',
        },
      ],
    },
  ],
};

export default menuObject;
