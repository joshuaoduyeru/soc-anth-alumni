export const BADGE_TYPES = [
  { id: 'pioneer',               name: 'Pioneer',               icon: '🚀', description: 'First to register on the platform',                  category: 'milestone'    },
  { id: 'super_mentor',          name: 'Super Mentor',          icon: '👨‍🏫', description: 'Demonstrated active and impactful mentorship',        category: 'mentorship'   },
  { id: 'network_champion',      name: 'Network Champion',      icon: '🤝', description: 'Most connections within the alumni network',           category: 'community'    },
  { id: 'distinguished_speaker', name: 'Distinguished Speaker', icon: '🎤', description: 'Presented at an alumni event',                        category: 'events'       },
  { id: 'generous_donor',        name: 'Generous Donor',        icon: '💰', description: 'Made a financial contribution to the institution',     category: 'contribution' },
  { id: 'active_volunteer',      name: 'Active Volunteer',      icon: '🙋', description: 'Actively participated in volunteering activities',     category: 'contribution' },
  { id: 'career_achiever',       name: 'Career Achiever',       icon: '📈', description: 'Reached a significant career milestone',              category: 'milestone'    },
  { id: 'top_recruiter',         name: 'Top Recruiter',         icon: '👔', description: 'Posted multiple job opportunities for the community',  category: 'contribution' },
  { id: 'alumni_of_the_year',    name: 'Alumni of the Year',    icon: '🎓', description: 'Recognised as Alumni of the Year',                    category: 'award'        },
] as const

export type BadgeTypeId = typeof BADGE_TYPES[number]['id']