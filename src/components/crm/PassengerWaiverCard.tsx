'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckCircle,
  Clock,
  Mail,
  Phone,
  User,
  Baby,
  Crown,
  Send,
  PenTool,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PassengerWaiverStatus } from '@/types/crm';

interface ClientConsentCardProps {
  passenger: PassengerWaiverStatus;
  onSendReminder?: () => void;
  onCollectSignature?: () => void;
  isLoading?: boolean;
  showActions?: boolean;
}

/** @deprecated Alias for ClientConsentCard */
export const PassengerWaiverCard = ClientConsentCard;

export function ClientConsentCard({
  passenger,
  onSendReminder,
  onCollectSignature,
  isLoading = false,
  showActions = true,
}: ClientConsentCardProps) {
  const hasContact = passenger.email || passenger.phone;

  return (
    <div
      className={cn(
        'flex items-center justify-between p-4 rounded-lg border transition-colors',
        passenger.waiverSigned
          ? 'bg-emerald-50 border-emerald-200'
          : 'bg-white border-slate-200 hover:border-slate-300'
      )}
    >
      <div className="flex items-center gap-4">
        {/* Status Icon */}
        <div
          className={cn(
            'p-2 rounded-full',
            passenger.waiverSigned ? 'bg-emerald-100' : 'bg-slate-100'
          )}
        >
          {passenger.waiverSigned ? (
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          ) : (
            <Clock className="w-5 h-5 text-slate-400" />
          )}
        </div>

        {/* Client Info */}
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-900">{passenger.fullName}</span>
            {passenger.isPrimaryRenter && (
              <Badge variant="outline" className="gap-1 text-xs bg-amber-50 text-amber-700 border-amber-200">
                <Crown className="w-3 h-3" />
                Primary
              </Badge>
            )}
            {passenger.isMinor && (
              <Badge variant="outline" className="gap-1 text-xs bg-blue-50 text-blue-700 border-blue-200">
                <Baby className="w-3 h-3" />
                Minor
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
            {passenger.email && (
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {passenger.email}
              </span>
            )}
            {passenger.phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {passenger.phone}
              </span>
            )}
            {!hasContact && (
              <span className="flex items-center gap-1 text-slate-400">
                <User className="w-3 h-3" />
                No contact info
              </span>
            )}
          </div>

          {passenger.waiverSigned && passenger.signedAt && (
            <div className="mt-1 text-xs text-emerald-600">
              Signed {new Date(passenger.signedAt).toLocaleString()}
              {passenger.collectionMethod && (
                <span className="ml-2 text-slate-400">
                  via {passenger.collectionMethod.replace('_', ' ')}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {showActions && !passenger.waiverSigned && (
        <div className="flex items-center gap-2">
          {hasContact && onSendReminder && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSendReminder}
              disabled={isLoading}
              className="gap-1"
            >
              <Send className="w-4 h-4" />
              Remind
            </Button>
          )}
          {onCollectSignature && (
            <Button
              size="sm"
              onClick={onCollectSignature}
              disabled={isLoading}
              className="gap-1 bg-blue-600 hover:bg-blue-700"
            >
              <PenTool className="w-4 h-4" />
              Sign Now
            </Button>
          )}
        </div>
      )}

      {/* Signed Badge */}
      {passenger.waiverSigned && (
        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Signed
        </Badge>
      )}
    </div>
  );
}
