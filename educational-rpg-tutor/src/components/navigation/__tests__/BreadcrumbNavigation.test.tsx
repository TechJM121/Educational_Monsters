import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { BreadcrumbNavigation } from '../BreadcrumbNavigation';

const renderWithRouter = (component: React.ReactElement, initialRoute = '/') => {
  window.history.pushState({}, 'Test page', initialRoute);
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('BreadcrumbNavigation', () => {
  it('renders custom breadcrumb items when provided', () => {
    const customItems = [
      { label: 'Home', path: '/home', isActive: false },
      { label: 'Custom Page', isActive: true }
    ];

    renderWithRouter(<BreadcrumbNavigation items={customItems} />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Custom Page')).toBeInTheDocument();
  });

  it('generates breadcrumbs from current route when no items provided', () => {
    renderWithRouter(<BreadcrumbNavigation />, '/character');

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Character')).toBeInTheDocument();
  });

  it('renders breadcrumbs for nested routes', () => {
    renderWithRouter(<BreadcrumbNavigation />, '/character/customization');

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Character')).toBeInTheDocument();
    expect(screen.getByText('Customization')).toBeInTheDocument();
  });

  it('does not render when only one breadcrumb item', () => {
    const singleItem = [
      { label: 'Home', path: '/home', isActive: true }
    ];

    const { container } = renderWithRouter(<BreadcrumbNavigation items={singleItem} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders active item without link', () => {
    const items = [
      { label: 'Home', path: '/home', isActive: false },
      { label: 'Active Page', isActive: true }
    ];

    renderWithRouter(<BreadcrumbNavigation items={items} />);

    const homeLink = screen.getByRole('link', { name: 'Home' });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/home');

    const activePage = screen.getByText('Active Page');
    expect(activePage).toBeInTheDocument();
    expect(activePage.tagName).toBe('SPAN');
  });

  it('includes RPG-themed separators between items', () => {
    const items = [
      { label: 'Home', path: '/home', isActive: false },
      { label: 'Character', path: '/character', isActive: false },
      { label: 'Stats', isActive: true }
    ];

    renderWithRouter(<BreadcrumbNavigation items={items} />);

    // Should have 2 separators for 3 items
    const separators = screen.getAllByText('⚔️');
    expect(separators).toHaveLength(2);
  });

  it('applies correct ARIA attributes for accessibility', () => {
    const items = [
      { label: 'Home', path: '/home', isActive: false },
      { label: 'Current Page', isActive: true }
    ];

    renderWithRouter(<BreadcrumbNavigation items={items} />);

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Breadcrumb');

    const currentPage = screen.getByText('Current Page');
    expect(currentPage).toHaveAttribute('aria-current', 'page');
  });
});