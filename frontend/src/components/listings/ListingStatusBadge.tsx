import Badge from '../common/Badge';
import {
  STATUS_BADGE_VARIANT,
  STATUS_LABELS,
} from '../../features/listings/constants';
import type { ListingStatus } from '../../types';

interface ListingStatusBadgeProps {
  status: ListingStatus;
  className?: string;
}

export default function ListingStatusBadge({
  status,
  className,
}: ListingStatusBadgeProps) {
  return (
    <Badge variant={STATUS_BADGE_VARIANT[status]} className={className}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
