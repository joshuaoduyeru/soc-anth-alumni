// Barrel export for all Mongoose models
// Usage: import { User, Event, Job, Badge } from '@/models'

export { default as User } from './accounts/User.model'
export type { IUser, IEducation, INotificationPreferences, ISocialLinks } from './accounts/User.model'

export { Event, EventRegistration } from './events/Event.model'
export type { IEvent, IEventRegistration } from './events/Event.model'

export { default as Job } from './jobs/Job.model'
export type { IJob } from './jobs/Job.model'

export { MentorProfile, MentorshipRequest } from './mentorship/Mentorship.model'
export type { IMentorProfile, IMentorshipRequest } from './mentorship/Mentorship.model'

export { Badge, BADGE_TYPES } from './badges/Badge.model'
export type { IBadge, IBadgeType } from './badges/Badge.model'

export { default as Newsletter } from './communications/Newsletter.model'
export type { INewsletter } from './communications/Newsletter.model'

export { default as Notification } from './notifications/Notification.model'
export type { INotification } from './notifications/Notification.model'

export { default as AuditLog } from './audit/AuditLog.model'
export type { IAuditLog } from './audit/AuditLog.model'
