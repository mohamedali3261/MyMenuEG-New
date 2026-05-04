import { useStore } from '../store/store';
import NavbarVariant1 from './NavbarVariants/NavbarVariant1';
import NavbarVariant2 from './NavbarVariants/NavbarVariant2';
import NavbarVariant3 from './NavbarVariants/NavbarVariant3';

export default function Navbar() {
  const { branding } = useStore();

  // Render the appropriate navbar variant based on branding settings
  switch (branding.navbarStyle) {
    case 'variant2':
      return <NavbarVariant2 />;
    case 'variant3':
      return <NavbarVariant3 />;
    case 'variant1':
    default:
      return <NavbarVariant1 />;
  }
}
