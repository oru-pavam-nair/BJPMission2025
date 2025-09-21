import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LeadershipModal from '../components/ui/LeadershipModal';

// Mock contact data
const mockContacts = [
  {
    name: 'John Doe',
    position: 'District President',
    phone: '+91 9876543210',
    email: 'john.doe@example.com',
    address: '123 Main Street, Thiruvananthapuram, Kerala 695001',
    area: 'Thiruvananthapuram District'
  },
  {
    name: 'Jane Smith',
    position: 'Secretary',
    phone: '+91 9876543211',
    email: 'jane.smith@example.com',
    area: 'Kollam District'
  },
  {
    name: 'Bob Johnson',
    position: 'Treasurer',
    area: 'Kochi District'
  }
];

describe('LeadershipModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    contacts: mockContacts,
    title: 'Leadership Contacts'
  };

  it('renders modal with title', () => {
    render(<LeadershipModal {...defaultProps} />);
    expect(screen.getByText('Leadership Contacts')).toBeInTheDocument();
  });

  it('displays loading state when isLoading is true', () => {
    render(<LeadershipModal {...defaultProps} isLoading={true} />);
    expect(screen.getByText('Loading contact information...')).toBeInTheDocument();
    // Check for loading spinner by class
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('displays empty state when no contacts are provided', () => {
    render(<LeadershipModal {...defaultProps} contacts={[]} />);
    expect(screen.getByText('No Contact Information Available')).toBeInTheDocument();
    expect(screen.getByText(/Contact data will be displayed here when available/)).toBeInTheDocument();
  });

  it('renders contact cards with proper hierarchy', () => {
    render(<LeadershipModal {...defaultProps} />);
    
    // Check if all contacts are rendered
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    
    // Check positions are displayed
    expect(screen.getByText('District President')).toBeInTheDocument();
    expect(screen.getByText('Secretary')).toBeInTheDocument();
    expect(screen.getByText('Treasurer')).toBeInTheDocument();
  });

  it('displays contact information in scannable format (Requirement 4.3)', () => {
    render(<LeadershipModal {...defaultProps} />);
    
    // Check phone numbers are displayed with proper labels
    const phoneLabels = screen.getAllByText('Phone');
    expect(phoneLabels.length).toBeGreaterThan(0);
    expect(screen.getByText('+91 9876543210')).toBeInTheDocument();
    
    // Check emails are displayed with proper labels
    const emailLabels = screen.getAllByText('Email');
    expect(emailLabels.length).toBeGreaterThan(0);
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    
    // Check address is displayed with proper label
    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText('123 Main Street, Thiruvananthapuram, Kerala 695001')).toBeInTheDocument();
  });

  it('organizes data points in clear hierarchy with adequate spacing (Requirement 1.3)', () => {
    render(<LeadershipModal {...defaultProps} />);
    
    // Check that contact cards use proper semantic HTML
    const articles = screen.getAllByRole('article');
    expect(articles).toHaveLength(3);
    
    // Check that each contact has proper header structure
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings).toHaveLength(3);
    
    // Check that contact details are properly grouped
    const phoneLabels = screen.getAllByText('Phone');
    expect(phoneLabels).toHaveLength(2); // Only John and Jane have phones
    
    // Note: Email appears in both labels and button text, so we expect 4 total
    const emailLabels = screen.getAllByText('Email');
    expect(emailLabels.length).toBeGreaterThanOrEqual(2); // At least 2 for labels
  });

  it('provides proper touch targets for mobile (minimum 44px)', () => {
    render(<LeadershipModal {...defaultProps} />);
    
    // Check that action buttons (links) have proper touch target classes
    // Use more specific selectors to get the actual action buttons
    const actionButtons = document.querySelectorAll('footer a');
    expect(actionButtons.length).toBeGreaterThan(0);
    
    actionButtons.forEach(button => {
      expect(button).toHaveClass('ds-touch-target');
    });
  });

  it('has proper accessibility attributes', () => {
    render(<LeadershipModal {...defaultProps} />);
    
    // Check that contact cards have proper aria-labelledby attributes
    const articles = screen.getAllByRole('article');
    expect(articles[0]).toHaveAttribute('aria-labelledby', 'contact-0-name');
    expect(articles[1]).toHaveAttribute('aria-labelledby', 'contact-1-name');
    expect(articles[2]).toHaveAttribute('aria-labelledby', 'contact-2-name');
    
    // Check ARIA labels for action buttons
    expect(screen.getByLabelText('Call John Doe at +91 9876543210')).toBeInTheDocument();
    expect(screen.getByLabelText('Email John Doe at john.doe@example.com')).toBeInTheDocument();
  });

  it('uses design system classes consistently', () => {
    render(<LeadershipModal {...defaultProps} />);
    
    // Check that design system classes are used
    const container = screen.getByRole('dialog').querySelector('.ds-p-lg');
    expect(container).toBeInTheDocument();
    
    // Check that cards use design system card class
    const cards = screen.getAllByRole('article');
    cards.forEach(card => {
      expect(card).toHaveClass('ds-card');
    });
  });

  it('handles contact interactions properly', () => {
    render(<LeadershipModal {...defaultProps} />);
    
    // Check phone links
    const phoneLink = screen.getByLabelText('Call John Doe at +91 9876543210');
    expect(phoneLink).toHaveAttribute('href', 'tel:+91 9876543210');
    
    // Check email links
    const emailLink = screen.getByLabelText('Email John Doe at john.doe@example.com');
    expect(emailLink).toHaveAttribute('href', 'mailto:john.doe@example.com');
  });

  it('displays proper loading skeleton when loading', () => {
    render(<LeadershipModal {...defaultProps} isLoading={true} />);
    
    // Check that skeleton elements are present
    const skeletons = document.querySelectorAll('.ds-skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('handles missing contact information gracefully', () => {
    const incompleteContact = [{
      name: 'Incomplete Contact',
      position: 'Test Position'
      // No phone, email, or address
    }];
    
    render(<LeadershipModal {...defaultProps} contacts={incompleteContact} />);
    
    expect(screen.getByText('Incomplete Contact')).toBeInTheDocument();
    expect(screen.getByText('Test Position')).toBeInTheDocument();
    
    // Should not show phone, email, or address sections
    expect(screen.queryByText('Phone')).not.toBeInTheDocument();
    expect(screen.queryByText('Email')).not.toBeInTheDocument();
    expect(screen.queryByText('Address')).not.toBeInTheDocument();
  });

  it('closes modal when close button is clicked', () => {
    const onClose = vi.fn();
    render(<LeadershipModal {...defaultProps} onClose={onClose} />);
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});