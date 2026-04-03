-- ============================================================
-- FitTrack - Seed Exercise Library
-- ============================================================

INSERT INTO public.exercises (name, category, muscle_group, equipment, is_global) VALUES
-- CHEST
('Bench Press',           'chest',     '{"pectoralis_major","triceps","anterior_deltoid"}',      'barbell',    true),
('Incline Bench Press',   'chest',     '{"pectoralis_major","anterior_deltoid"}',                 'barbell',    true),
('Dumbbell Bench Press',  'chest',     '{"pectoralis_major","triceps"}',                          'dumbbell',   true),
('Dumbbell Fly',          'chest',     '{"pectoralis_major"}',                                    'dumbbell',   true),
('Cable Crossover',       'chest',     '{"pectoralis_major"}',                                    'cable',      true),
('Push-Up',               'chest',     '{"pectoralis_major","triceps"}',                          'bodyweight', true),
('Chest Dip',             'chest',     '{"pectoralis_major","triceps"}',                          'bodyweight', true),

-- BACK
('Deadlift',              'back',      '{"erector_spinae","glutes","hamstrings"}',                'barbell',    true),
('Pull-Up',               'back',      '{"latissimus_dorsi","biceps"}',                           'bodyweight', true),
('Chin-Up',               'back',      '{"latissimus_dorsi","biceps"}',                           'bodyweight', true),
('Barbell Row',           'back',      '{"latissimus_dorsi","rhomboids","biceps"}',               'barbell',    true),
('Dumbbell Row',          'back',      '{"latissimus_dorsi","rhomboids"}',                        'dumbbell',   true),
('Lat Pulldown',          'back',      '{"latissimus_dorsi","biceps"}',                           'cable',      true),
('Seated Cable Row',      'back',      '{"rhomboids","latissimus_dorsi"}',                        'cable',      true),
('Face Pull',             'back',      '{"rear_deltoid","rhomboids"}',                            'cable',      true),
('T-Bar Row',             'back',      '{"latissimus_dorsi","rhomboids"}',                        'barbell',    true),

-- LEGS
('Squat',                 'legs',      '{"quadriceps","glutes","hamstrings"}',                    'barbell',    true),
('Front Squat',           'legs',      '{"quadriceps","glutes"}',                                 'barbell',    true),
('Romanian Deadlift',     'legs',      '{"hamstrings","glutes"}',                                 'barbell',    true),
('Leg Press',             'legs',      '{"quadriceps","glutes"}',                                 'machine',    true),
('Leg Curl',              'legs',      '{"hamstrings"}',                                          'machine',    true),
('Leg Extension',         'legs',      '{"quadriceps"}',                                          'machine',    true),
('Lunge',                 'legs',      '{"quadriceps","glutes"}',                                 'bodyweight', true),
('Bulgarian Split Squat', 'legs',      '{"quadriceps","glutes"}',                                 'dumbbell',   true),
('Hip Thrust',            'legs',      '{"glutes","hamstrings"}',                                 'barbell',    true),
('Calf Raise',            'legs',      '{"calves"}',                                              'machine',    true),
('Hack Squat',            'legs',      '{"quadriceps","glutes"}',                                 'machine',    true),

-- SHOULDERS
('Overhead Press',        'shoulders', '{"anterior_deltoid","lateral_deltoid","triceps"}',        'barbell',    true),
('Dumbbell Shoulder Press','shoulders','{"anterior_deltoid","lateral_deltoid"}',                  'dumbbell',   true),
('Arnold Press',          'shoulders', '{"anterior_deltoid","lateral_deltoid"}',                  'dumbbell',   true),
('Lateral Raise',         'shoulders', '{"lateral_deltoid"}',                                     'dumbbell',   true),
('Front Raise',           'shoulders', '{"anterior_deltoid"}',                                    'dumbbell',   true),
('Rear Delt Fly',         'shoulders', '{"rear_deltoid"}',                                        'dumbbell',   true),
('Cable Lateral Raise',   'shoulders', '{"lateral_deltoid"}',                                     'cable',      true),

-- ARMS
('Barbell Curl',          'arms',      '{"biceps"}',                                              'barbell',    true),
('Dumbbell Curl',         'arms',      '{"biceps"}',                                              'dumbbell',   true),
('Hammer Curl',           'arms',      '{"biceps","brachioradialis"}',                            'dumbbell',   true),
('Preacher Curl',         'arms',      '{"biceps"}',                                              'machine',    true),
('Cable Curl',            'arms',      '{"biceps"}',                                              'cable',      true),
('Incline Dumbbell Curl', 'arms',      '{"biceps"}',                                              'dumbbell',   true),
('Tricep Pushdown',       'arms',      '{"triceps"}',                                             'cable',      true),
('Skull Crusher',         'arms',      '{"triceps"}',                                             'barbell',    true),
('Overhead Tricep Extension','arms',   '{"triceps"}',                                             'dumbbell',   true),
('Close Grip Bench Press','arms',      '{"triceps","chest"}',                                     'barbell',    true),
('Tricep Dip',            'arms',      '{"triceps","chest"}',                                     'bodyweight', true),

-- CORE
('Plank',                 'core',      '{"transverse_abdominis","rectus_abdominis"}',             'bodyweight', true),
('Crunch',                'core',      '{"rectus_abdominis"}',                                    'bodyweight', true),
('Leg Raise',             'core',      '{"rectus_abdominis","hip_flexors"}',                      'bodyweight', true),
('Russian Twist',         'core',      '{"obliques"}',                                            'bodyweight', true),
('Cable Crunch',          'core',      '{"rectus_abdominis"}',                                    'cable',      true),
('Ab Wheel Rollout',      'core',      '{"transverse_abdominis","rectus_abdominis"}',             'other',      true),
('Hanging Leg Raise',     'core',      '{"rectus_abdominis","hip_flexors"}',                      'bodyweight', true),
('Side Plank',            'core',      '{"obliques","transverse_abdominis"}',                     'bodyweight', true),

-- CARDIO
('Running',               'cardio',    '{"cardiovascular"}',                                      'other',      true),
('Cycling',               'cardio',    '{"cardiovascular","quadriceps"}',                         'machine',    true),
('Rowing Machine',        'cardio',    '{"cardiovascular","back","arms"}',                        'machine',    true),
('Jump Rope',             'cardio',    '{"cardiovascular","calves"}',                             'other',      true),
('Elliptical',            'cardio',    '{"cardiovascular"}',                                      'machine',    true),
('Stair Climber',         'cardio',    '{"cardiovascular","glutes","quadriceps"}',                'machine',    true),
('Swimming',              'cardio',    '{"cardiovascular","back","shoulders"}',                   'other',      true)

ON CONFLICT DO NOTHING;
