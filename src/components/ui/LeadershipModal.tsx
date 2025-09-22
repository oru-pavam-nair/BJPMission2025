import React from 'react';
import Modal from './Modal';
import { Phone, User } from 'lucide-react';
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

  // Contact table component matching the original design with support for different levels
  const ContactTable = () => {
    const level = title.toLowerCase();
    const isZoneLevel = level.includes('zone leadership');
    const isMandalLevel = level.includes('mandal contacts');
    const isLocalBodyLevel = level.includes('local body contacts');
    
    return (
      <div className="ds-p-lg">
        {/* Info header */}
        <div className="mb-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg flex items-center gap-3">
          <Phone className="w-5 h-5 text-green-400" />
          <div>
            <p className="text-green-300 font-medium">Contact Information:</p>
            <p className="text-slate-300 text-sm">
              {isZoneLevel ? 'Zone-level leadership contacts' :
               isMandalLevel ? 'Mandal-level contacts' :
               isLocalBodyLevel ? 'Local body contacts' :
               'Leadership contacts'}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-600">
                <th className="text-left py-3 px-4 text-slate-300 font-medium uppercase tracking-wide text-sm">
                  {isZoneLevel ? 'ZONES' : 
                   isMandalLevel ? 'MANDALS' :
                   isLocalBodyLevel ? 'LOCAL BODIES' : 'NAME'}
                </th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium uppercase tracking-wide text-sm">
                  PRIMARY CONTACT
                </th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium uppercase tracking-wide text-sm">
                  PHONE
                </th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium uppercase tracking-wide text-sm">
                  SECONDARY CONTACT
                </th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium uppercase tracking-wide text-sm">
                  PHONE
                </th>
                {isLocalBodyLevel && (
                  <>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium uppercase tracking-wide text-sm">
                      SECRETARY
                    </th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium uppercase tracking-wide text-sm">
                      PHONE
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact: any, index) => (
                <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-4 text-slate-200 font-medium">
                    {contact.name}
                    {contact.type && (
                      <div className="text-xs text-slate-400 mt-1">
                        {contact.type}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4 text-slate-300">
                    {contact.presidentName || contact.name || 'N/A'}
                  </td>
                  <td className="py-4 px-4">
                    {(contact.presidentPhone || contact.phone) && (contact.presidentPhone || contact.phone) !== 'N/A' ? (
                      <a 
                        href={`tel:${contact.presidentPhone || contact.phone}`}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        {contact.presidentPhone || contact.phone}
                      </a>
                    ) : (
                      <span className="text-slate-500">N/A</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-slate-300">
                    {contact.inchargeName || 'Incharge'}
                  </td>
                  <td className="py-4 px-4">
                    {contact.inchargePhone && contact.inchargePhone !== 'N/A' ? (
                      <a 
                        href={`tel:${contact.inchargePhone}`}
                        className="text-orange-400 hover:text-orange-300 transition-colors"
                      >
                        {contact.inchargePhone}
                      </a>
                    ) : (
                      <span className="text-slate-500">N/A</span>
                    )}
                  </td>
                  {isLocalBodyLevel && (
                    <>
                      <td className="py-4 px-4 text-slate-300">
                        {contact.secretaryName || 'N/A'}
                      </td>
                      <td className="py-4 px-4">
                        {contact.secretaryPhone && contact.secretaryPhone !== 'N/A' ? (
                          <a 
                            href={`tel:${contact.secretaryPhone}`}
                            className="text-green-400 hover:text-green-300 transition-colors"
                          >
                            {contact.secretaryPhone}
                          </a>
                        ) : (
                          <span className="text-slate-500">N/A</span>
                        )}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

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
        <ContactTable />
      )}
    </Modal>
  );
};

export default LeadershipModal;