import React from 'react';
import Modal from './Modal';
import { Phone, Mail, MapPin, User, Loader2 } from 'lucide-react';
import { LoadingIndicator } from './LoadingIndicator';
import { ErrorDisplay } from './ErrorBoundary';

interface ContactInfo {
  name: string;
  position?: string;
  phone?: string;
  email?: string;
  address?: string;
  area?: string;
}

interface LeadershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: ContactInfo[];
  title: string;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const LeadershipModal: React.FC<LeadershipModalProps> = ({
  isOpen,
  onClose,
  contacts,
  title,
  isLoading = false,
  error = null,
  onRetry
}) => {
  // Enhanced loading state component
  const LoadingState = () => (
    <div className="ds-p-lg">
      <div className="flex items-center justify-center ds-py-2xl">
        <LoadingIndicator
          size="md"
          variant="spinner"
          color="primary"
          text="Loading contact information..."
        />
      </div>
      {/* Loading skeleton cards */}
      <div className="ds-grid ds-gap-lg mt-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="ds-card">
            <div className="ds-skeleton h-6 w-3/4 mb-3"></div>
            <div className="ds-skeleton h-4 w-1/2 mb-4"></div>
            <div className="ds-grid ds-gap-md sm:grid-cols-2">
              <div className="ds-skeleton h-16 w-full"></div>
              <div className="ds-skeleton h-16 w-full"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="ds-p-lg">
      <div className="text-center ds-py-2xl">
        <User className="w-16 h-16 text-slate-400 mx-auto mb-6" />
        <h3 className="ds-text-heading-2 text-slate-300 mb-3">No Contact Information Available</h3>
        <p className="ds-text-body text-slate-400 max-w-md mx-auto">
          Contact data will be displayed here when available. Please check back later or contact your administrator.
        </p>
      </div>
    </div>
  );

  // Contact card component with improved hierarchy
  const ContactCard = ({ contact, index }: { contact: ContactInfo; index: number }) => (
    <article 
      className="ds-card hover:bg-slate-800/70 ds-transition-base"
      aria-labelledby={`contact-${index}-name`}
    >
      {/* Contact Header with Clear Hierarchy */}
      <header className="mb-6">
        <h3 
          id={`contact-${index}-name`}
          className="ds-text-heading-2 text-slate-100 mb-2"
        >
          {contact.name}
        </h3>
        {contact.position && (
          <p className="ds-text-body-large text-blue-400 font-medium mb-1">
            {contact.position}
          </p>
        )}
        {contact.area && (
          <p className="ds-text-small text-slate-400">
            {contact.area}
          </p>
        )}
      </header>

      {/* Contact Details with Improved Spacing */}
      <div className="ds-grid ds-gap-md sm:grid-cols-2 mb-6">
        {/* Phone */}
        {contact.phone && (
          <div className="flex items-center ds-gap-md ds-p-md bg-slate-900/50 ds-rounded-base">
            <div className="flex-shrink-0">
              <Phone className="w-5 h-5 text-green-400" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="ds-text-caption text-slate-400 uppercase tracking-wide mb-1">
                Phone
              </p>
              <a 
                href={`tel:${contact.phone}`}
                className="ds-text-small text-slate-200 hover:text-green-400 ds-transition-base break-all ds-focus-ring"
                aria-label={`Call ${contact.name} at ${contact.phone}`}
              >
                {contact.phone}
              </a>
            </div>
          </div>
        )}

        {/* Email */}
        {contact.email && (
          <div className="flex items-center ds-gap-md ds-p-md bg-slate-900/50 ds-rounded-base">
            <div className="flex-shrink-0">
              <Mail className="w-5 h-5 text-blue-400" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="ds-text-caption text-slate-400 uppercase tracking-wide mb-1">
                Email
              </p>
              <a 
                href={`mailto:${contact.email}`}
                className="ds-text-small text-slate-200 hover:text-blue-400 ds-transition-base break-all ds-focus-ring"
                aria-label={`Email ${contact.name} at ${contact.email}`}
              >
                {contact.email}
              </a>
            </div>
          </div>
        )}

        {/* Address */}
        {contact.address && (
          <div className="flex items-start ds-gap-md ds-p-md bg-slate-900/50 ds-rounded-base sm:col-span-2">
            <div className="flex-shrink-0 mt-1">
              <MapPin className="w-5 h-5 text-amber-400" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="ds-text-caption text-slate-400 uppercase tracking-wide mb-1">
                Address
              </p>
              <address className="ds-text-small text-slate-200 leading-relaxed not-italic">
                {contact.address}
              </address>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons with Touch Targets */}
      <footer className="flex flex-wrap ds-gap-sm pt-4 border-t border-slate-700/50">
        {contact.phone && (
          <a
            href={`tel:${contact.phone}`}
            className="
              ds-touch-target inline-flex items-center ds-gap-sm ds-p-md ds-text-small
              bg-green-600/20 text-green-400 ds-rounded-base
              hover:bg-green-600/30 ds-transition-base ds-focus-ring
            "
            aria-label={`Call ${contact.name}`}
          >
            <Phone className="w-4 h-4" aria-hidden="true" />
            Call
          </a>
        )}
        {contact.email && (
          <a
            href={`mailto:${contact.email}`}
            className="
              ds-touch-target inline-flex items-center ds-gap-sm ds-p-md ds-text-small
              bg-blue-600/20 text-blue-400 ds-rounded-base
              hover:bg-blue-600/30 ds-transition-base ds-focus-ring
            "
            aria-label={`Email ${contact.name}`}
          >
            <Mail className="w-4 h-4" aria-hidden="true" />
            Email
          </a>
        )}
      </footer>
    </article>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
    >
      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <div className="ds-p-lg">
          <ErrorDisplay
            error={new Error(error)}
            title="Failed to Load Contact Information"
            onRetry={onRetry}
            className="my-8"
          />
        </div>
      ) : contacts.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="ds-p-lg">
          <div className="ds-grid ds-gap-lg">
            {contacts.map((contact, index) => (
              <ContactCard key={index} contact={contact} index={index} />
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default LeadershipModal;