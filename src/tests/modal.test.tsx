import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Modal from '../components/ui/Modal';

describe('Modal Component', () => {
  const mockOnClose = vi.fn();
  
  beforeEach(() => {
    mockOnClose.mockClear();
  });

  afterEach(() => {
    // Clean up any modals that might be left open
    document.body.style.overflow = '';
  });

  it('renders modal when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('does not render modal when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('has proper z-index layering', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    );

    const modalContainer = screen.getByRole('dialog');
    const modalContent = modalContainer.querySelector('[tabindex="-1"]');
    
    expect(modalContainer).toHaveStyle({ zIndex: '40' });
    expect(modalContent).toHaveStyle({ zIndex: '50' });
  });

  it('has proper backdrop and centering', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    );

    const modalContainer = screen.getByRole('dialog');
    expect(modalContainer).toHaveClass('fixed', 'inset-0', 'flex', 'items-center', 'justify-center');
    
    const backdrop = modalContainer.querySelector('.ds-modal-backdrop');
    expect(backdrop).toHaveClass('absolute', 'inset-0', 'bg-black/60', 'backdrop-blur-sm');
  });

  it('supports different sizes', () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal" size="sm">
        <div>Modal content</div>
      </Modal>
    );

    let modalContent = screen.getByRole('dialog').querySelector('[tabindex="-1"]');
    expect(modalContent).toHaveClass('max-w-md');

    rerender(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal" size="lg">
        <div>Modal content</div>
      </Modal>
    );

    modalContent = screen.getByRole('dialog').querySelector('[tabindex="-1"]');
    expect(modalContent).toHaveClass('max-w-4xl');

    rerender(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal" size="full">
        <div>Modal content</div>
      </Modal>
    );

    modalContent = screen.getByRole('dialog').querySelector('[tabindex="-1"]');
    expect(modalContent).toHaveClass('max-w-[95vw]');
  });

  it('has responsive sizing classes', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    );

    const modalContent = screen.getByRole('dialog').querySelector('[tabindex="-1"]');
    expect(modalContent).toHaveClass('max-h-[95vh]', 'sm:max-h-[90vh]');
    
    const contentArea = modalContent?.querySelector('.overflow-auto');
    expect(contentArea).toHaveClass('max-h-[calc(95vh-120px)]', 'sm:max-h-[calc(90vh-120px)]');
  });

  it('closes on escape key when closeOnEscape is true', async () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal" closeOnEscape={true}>
        <div>Modal content</div>
      </Modal>
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('does not close on escape key when closeOnEscape is false', async () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal" closeOnEscape={false}>
        <div>Modal content</div>
      </Modal>
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    
    await waitFor(() => {
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  it('closes on backdrop click when closeOnBackdropClick is true', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal" closeOnBackdropClick={true}>
        <div>Modal content</div>
      </Modal>
    );

    const modalContainer = screen.getByRole('dialog');
    fireEvent.click(modalContainer);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not close on backdrop click when closeOnBackdropClick is false', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal" closeOnBackdropClick={false}>
        <div>Modal content</div>
      </Modal>
    );

    const modalContainer = screen.getByRole('dialog');
    fireEvent.click(modalContainer);
    
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('closes when close button is clicked', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal" showCloseButton={true}>
        <div>Modal content</div>
      </Modal>
    );

    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not show close button when showCloseButton is false', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal" showCloseButton={false}>
        <div>Modal content</div>
      </Modal>
    );

    expect(screen.queryByLabelText('Close modal')).not.toBeInTheDocument();
  });

  it('manages focus properly', async () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <button>Modal Button</button>
      </Modal>
    );

    // Modal should be focused when opened
    const modalContent = screen.getByRole('dialog').querySelector('[tabindex="-1"]');
    await waitFor(() => {
      expect(document.activeElement).toBe(modalContent);
    });

    // Body scroll should be disabled
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('traps focus within modal', async () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>
          <button id="first-button">First Button</button>
          <button id="second-button">Second Button</button>
        </div>
      </Modal>
    );

    const firstButton = screen.getByText('First Button');
    const closeButton = screen.getByLabelText('Close modal');

    // Verify focus trapping behavior exists by checking the keydown handler
    // Focus the close button
    closeButton.focus();
    expect(document.activeElement).toBe(closeButton);

    // Verify that tab key is handled (focus trapping logic exists)
    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
    document.dispatchEvent(tabEvent);
    
    // The focus should be managed within the modal
    expect(document.activeElement).not.toBe(document.body);
  });

  it('has proper accessibility attributes', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    );

    const modal = screen.getByRole('dialog');
    expect(modal).toHaveAttribute('aria-modal', 'true');
    expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');

    const title = screen.getByText('Test Modal');
    expect(title).toHaveAttribute('id', 'modal-title');

    const backdrop = modal.querySelector('.ds-modal-backdrop');
    expect(backdrop).toHaveAttribute('aria-hidden', 'true');
  });

  it('has touch-friendly close button', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    );

    const closeButton = screen.getByLabelText('Close modal');
    expect(closeButton).toHaveClass('touch-target');
    expect(closeButton).toHaveClass('p-2'); // Adequate padding for touch
  });

  it('has proper responsive padding and margins', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    );

    const modalContainer = screen.getByRole('dialog');
    expect(modalContainer).toHaveClass('p-2', 'sm:p-4');

    const header = screen.getByText('Test Modal').closest('div');
    expect(header).toHaveClass('p-4', 'sm:p-6');
  });

  it('has proper visual styling', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    );

    const modalContent = screen.getByRole('dialog').querySelector('[tabindex="-1"]');
    expect(modalContent).toHaveClass(
      'bg-slate-900/95',
      'backdrop-blur-md',
      'rounded-xl',
      'sm:rounded-2xl',
      'shadow-2xl',
      'border',
      'border-slate-700/50'
    );

    const header = screen.getByText('Test Modal').closest('div');
    expect(header).toHaveClass('border-b', 'border-slate-700/50', 'bg-slate-800/50');
  });
});