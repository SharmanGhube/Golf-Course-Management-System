-- Golf Course Management System - Sample Data Insertion Script
-- This script inserts 50+ records across all tables in the database

USE golf_course_db;

-- Disable foreign key checks temporarily for easier insertion
SET FOREIGN_KEY_CHECKS = 0;

-- ===============================\
-- 1. INSERT USERS (20 records)
-- ===============================
INSERT INTO users (email, password_hash, first_name, last_name, phone, date_of_birth, role, membership_type, membership_expiry, handicap, is_active, email_verified) VALUES
('admin@golf.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John', 'Administrator', '+1-555-0001', '1980-01-15', 'admin', 'premium', '2026-12-31', 5.2, TRUE, TRUE),
('staff1@golf.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sarah', 'Johnson', '+1-555-0002', '1985-03-22', 'staff', 'standard', '2026-06-30', 12.4, TRUE, TRUE),
('staff2@golf.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Mike', 'Wilson', '+1-555-0003', '1988-07-10', 'staff', 'standard', '2026-06-30', 8.7, TRUE, TRUE),
('member1@golf.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'David', 'Thompson', '+1-555-0004', '1975-11-08', 'member', 'premium', '2026-12-31', 3.1, TRUE, TRUE),
('member2@golf.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Lisa', 'Anderson', '+1-555-0005', '1982-05-18', 'member', 'premium', '2026-12-31', 6.8, TRUE, TRUE),
('member3@golf.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Robert', 'Davis', '+1-555-0006', '1970-09-25', 'member', 'standard', '2026-08-15', 9.2, TRUE, TRUE),
('customer1@golf.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Emily', 'Brown', '+1-555-0007', '1990-02-14', 'customer', 'basic', NULL, 15.6, TRUE, TRUE),
('customer2@golf.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'James', 'Miller', '+1-555-0008', '1987-12-03', 'customer', 'basic', NULL, 18.3, TRUE, TRUE),
('customer3@golf.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jennifer', 'Garcia', '+1-555-0009', '1992-06-30', 'customer', 'standard', '2025-12-31', 22.1, TRUE, TRUE),
('customer4@golf.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Chris', 'Martinez', '+1-555-0010', '1983-04-12', 'customer', 'basic', NULL, 13.7, TRUE, TRUE),
('customer5@golf.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Amanda', 'Rodriguez', '+1-555-0011', '1989-08-21', 'customer', 'standard', '2025-10-15', 11.4, TRUE, TRUE),
('customer6@golf.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Kevin', 'Lee', '+1-555-0012', '1974-01-07', 'customer', 'premium', '2026-03-20', 4.9, TRUE, TRUE),
('customer7@golf.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nicole', 'Taylor', '+1-555-0013', '1986-10-16', 'customer', 'basic', NULL, 19.8, TRUE, TRUE),
('customer8@golf.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Brian', 'White', '+1-555-0014', '1991-03-29', 'customer', 'standard', '2025-11-30', 14.2, TRUE, TRUE),
('customer9@golf.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Michelle', 'Harris', '+1-555-0015', '1984-07-04', 'customer', 'basic', NULL, 16.5, TRUE, TRUE),
('customer10@golf.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Daniel', 'Clark', '+1-555-0016', '1977-11-11', 'customer', 'premium', '2026-01-15', 7.3, TRUE, TRUE),
('customer11@golf.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Rachel', 'Lewis', '+1-555-0017', '1993-09-08', 'customer', 'basic', NULL, 25.4, TRUE, TRUE),
('customer12@golf.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Steven', 'Walker', '+1-555-0018', '1981-05-26', 'customer', 'standard', '2025-09-10', 10.8, TRUE, TRUE),
('customer13@golf.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jessica', 'Hall', '+1-555-0019', '1988-12-17', 'customer', 'basic', NULL, 21.6, TRUE, TRUE),
('customer14@golf.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Matthew', 'Young', '+1-555-0020', '1976-02-28', 'customer', 'premium', '2026-05-25', 2.7, TRUE, TRUE);

-- ===============================
-- 2. INSERT ADDITIONAL COURSES (3 more records)
-- ===============================
INSERT INTO courses (name, description, address, phone, email, par, total_holes, course_rating, slope_rating, green_fee, cart_fee, is_active) VALUES
('Ocean View Golf Resort', 'Spectacular oceanfront golf course with challenging coastal winds and breathtaking views.', '456 Ocean Drive, Monterey, CA 93940', '+1-555-OCEAN-1', 'info@oceanviewgolf.com', 71, 18, 73.2, 142, 95.00, 35.00, TRUE),
('Mountain Ridge Country Club', 'Championship mountain course featuring elevation changes and pristine conditions.', '789 Mountain Road, Aspen, CO 81611', '+1-555-MOUNT-1', 'pro@mountainridge.com', 72, 18, 74.1, 138, 125.00, 40.00, TRUE),
('Desert Springs Golf Club', 'Desert-style course with strategic water features and stunning desert landscape.', '321 Desert Lane, Scottsdale, AZ 85260', '+1-555-DESERT-1', 'info@desertsprings.com', 72, 18, 71.8, 128, 85.00, 30.00, TRUE);

-- ===============================
-- 3. INSERT TEE TIMES (15 records)
-- ===============================
INSERT INTO tee_times (course_id, user_id, booking_date, tee_time, players_count, cart_required, total_amount, payment_status, booking_status, special_requests) VALUES
(1, 4, '2025-09-25', '07:30:00', 4, TRUE, 400.00, 'paid', 'confirmed', 'Early morning preferred'),
(1, 5, '2025-09-25', '08:00:00', 2, FALSE, 150.00, 'paid', 'confirmed', NULL),
(1, 6, '2025-09-26', '09:15:00', 3, TRUE, 300.00, 'paid', 'confirmed', 'Birthday celebration'),
(1, 7, '2025-09-26', '10:30:00', 1, FALSE, 75.00, 'pending', 'confirmed', NULL),
(1, 8, '2025-09-27', '07:45:00', 4, TRUE, 400.00, 'paid', 'confirmed', 'Corporate outing'),
(2, 9, '2025-09-27', '08:30:00', 2, TRUE, 260.00, 'paid', 'confirmed', NULL),
(2, 10, '2025-09-28', '09:00:00', 4, TRUE, 520.00, 'paid', 'confirmed', 'Tournament practice'),
(2, 11, '2025-09-28', '11:15:00', 2, FALSE, 190.00, 'pending', 'confirmed', NULL),
(3, 12, '2025-09-29', '07:00:00', 3, TRUE, 465.00, 'paid', 'confirmed', 'Early tee time requested'),
(3, 13, '2025-09-29', '10:45:00', 1, FALSE, 125.00, 'paid', 'confirmed', NULL),
(3, 14, '2025-09-30', '08:15:00', 4, TRUE, 620.00, 'paid', 'confirmed', 'Group lesson follow-up'),
(4, 15, '2025-09-30', '09:30:00', 2, FALSE, 170.00, 'pending', 'confirmed', NULL),
(1, 16, '2025-10-01', '07:30:00', 4, TRUE, 400.00, 'paid', 'confirmed', 'Weekly group'),
(2, 17, '2025-10-01', '11:00:00', 1, FALSE, 95.00, 'paid', 'confirmed', NULL),
(1, 18, '2025-10-02', '08:45:00', 3, TRUE, 300.00, 'pending', 'confirmed', 'Ladies group');

-- ===============================
-- 4. INSERT RANGE SESSIONS (10 records)
-- ===============================
INSERT INTO range_sessions (user_id, session_date, start_time, duration_minutes, ball_bucket_size, bucket_price, bay_number, payment_status, session_status) VALUES
(4, '2025-09-22', '08:00:00', 60, 'large', 16.00, 5, 'paid', 'completed'),
(5, '2025-09-22', '09:30:00', 90, 'jumbo', 22.00, 8, 'paid', 'completed'),
(6, '2025-09-22', '10:15:00', 45, 'medium', 12.00, 3, 'paid', 'completed'),
(7, '2025-09-23', '07:45:00', 60, 'large', 16.00, 12, 'paid', 'active'),
(8, '2025-09-23', '11:00:00', 30, 'small', 8.00, 7, 'paid', 'booked'),
(9, '2025-09-23', '14:30:00', 75, 'jumbo', 22.00, 15, 'pending', 'booked'),
(10, '2025-09-24', '08:30:00', 60, 'large', 16.00, 4, 'paid', 'booked'),
(11, '2025-09-24', '16:00:00', 45, 'medium', 12.00, 9, 'paid', 'booked'),
(12, '2025-09-24', '17:15:00', 90, 'jumbo', 22.00, 11, 'pending', 'booked'),
(13, '2025-09-25', '07:00:00', 60, 'large', 16.00, 6, 'paid', 'booked');

-- ===============================
-- 5. INSERT EQUIPMENT RENTALS (8 records)
-- ===============================
INSERT INTO equipment_rentals (user_id, equipment_id, rental_date, return_date, quantity, rental_price, deposit_amount, payment_status, rental_status, notes) VALUES
(7, 1, '2025-09-22', '2025-09-22', 1, 25.00, 50.00, 'paid', 'returned', 'Beginner set in good condition'),
(8, 6, '2025-09-22', NULL, 1, 30.00, 100.00, 'paid', 'rented', 'Electric cart for tournament'),
(9, 3, '2025-09-23', '2025-09-23', 1, 50.00, 150.00, 'paid', 'returned', 'Premium clubs used for lesson'),
(10, 7, '2025-09-23', NULL, 1, 15.00, 25.00, 'paid', 'rented', 'Push cart rental'),
(11, 8, '2025-09-24', '2025-09-24', 2, 24.00, 40.00, 'paid', 'returned', 'Golf shoes size 10 and 8'),
(12, 2, '2025-09-24', NULL, 1, 35.00, 75.00, 'paid', 'rented', 'Intermediate set for practice'),
(13, 9, '2025-09-25', '2025-09-25', 3, 15.00, 15.00, 'paid', 'returned', 'Golf gloves for group'),
(14, 10, '2025-09-25', NULL, 1, 20.00, 50.00, 'paid', 'rented', 'Range finder for course');

-- ===============================
-- 6. INSERT TOURNAMENTS (3 records)
-- ===============================
INSERT INTO tournaments (name, description, course_id, start_date, end_date, entry_fee, max_participants, tournament_type, status, prize_pool, registration_deadline) VALUES
('Pine Valley Championship', 'Annual club championship tournament open to all members and guests.', 1, '2025-10-15', '2025-10-16', 125.00, 72, 'stroke_play', 'upcoming', 5000.00, '2025-10-10'),
('Ocean View Pro-Am', 'Professional-amateur tournament with celebrity guests.', 2, '2025-11-08', '2025-11-09', 275.00, 48, 'best_ball', 'upcoming', 15000.00, '2025-11-01'),
('Desert Springs Scramble', 'Fun four-person scramble tournament with prizes.', 4, '2025-10-22', '2025-10-22', 75.00, 80, 'scramble', 'upcoming', 2500.00, '2025-10-18');

-- ===============================
-- 7. INSERT TOURNAMENT PARTICIPANTS (12 records)
-- ===============================
INSERT INTO tournament_participants (tournament_id, user_id, handicap_at_registration, payment_status) VALUES
(1, 4, 3.1, 'paid'),
(1, 5, 6.8, 'paid'),
(1, 6, 9.2, 'paid'),
(1, 12, 4.9, 'paid'),
(1, 16, 7.3, 'pending'),
(1, 20, 2.7, 'paid'),
(2, 4, 3.1, 'paid'),
(2, 5, 6.8, 'paid'),
(2, 12, 4.9, 'paid'),
(3, 8, 18.3, 'paid'),
(3, 9, 22.1, 'paid'),
(3, 10, 13.7, 'pending');

-- ===============================
-- 8. INSERT SCORECARDS (5 records)
-- ===============================
INSERT INTO scorecards (user_id, course_id, tee_time_id, played_date, total_score, total_putts, fairways_hit, greens_in_regulation, handicap_used, weather_conditions, notes, is_tournament_round) VALUES
(4, 1, 1, '2025-09-15', 76, 32, 12, 14, 3.1, 'Sunny, light breeze', 'Great round, personal best', FALSE),
(5, 1, 2, '2025-09-16', 82, 35, 8, 11, 6.8, 'Partly cloudy', 'Struggled with putting', FALSE),
(6, 2, 6, '2025-09-17', 89, 38, 6, 8, 9.2, 'Windy conditions', 'Challenging ocean course', FALSE),
(12, 3, 9, '2025-09-18', 79, 29, 10, 13, 4.9, 'Perfect conditions', 'Excellent putting round', FALSE),
(20, 1, NULL, '2025-09-19', 71, 28, 14, 16, 2.7, 'Morning frost, calm', 'Sub-par round!', FALSE);

-- ===============================
-- 9. INSERT PAYMENTS (10 records)
-- ===============================
INSERT INTO payments (user_id, reference_type, reference_id, amount, payment_method, payment_status, processed_at) VALUES
(4, 'tee_time', 1, 400.00, 'credit_card', 'succeeded', '2025-09-20 14:30:00'),
(5, 'tee_time', 2, 150.00, 'debit_card', 'succeeded', '2025-09-20 15:15:00'),
(6, 'tee_time', 3, 300.00, 'credit_card', 'succeeded', '2025-09-21 09:45:00'),
(8, 'tee_time', 5, 400.00, 'credit_card', 'succeeded', '2025-09-21 16:20:00'),
(9, 'range_session', 6, 22.00, 'cash', 'pending', NULL),
(10, 'tournament', 1, 125.00, 'credit_card', 'succeeded', '2025-09-19 11:30:00'),
(11, 'equipment_rental', 5, 24.00, 'debit_card', 'succeeded', '2025-09-24 08:15:00'),
(12, 'tee_time', 9, 465.00, 'credit_card', 'succeeded', '2025-09-22 13:45:00'),
(13, 'equipment_rental', 7, 15.00, 'cash', 'succeeded', '2025-09-25 10:30:00'),
(14, 'tournament', 3, 75.00, 'credit_card', 'succeeded', '2025-09-21 17:00:00');

-- ===============================
-- 10. INSERT WEATHER LOGS (7 records)
-- ===============================
INSERT INTO weather_logs (course_id, date, temperature, humidity, wind_speed, wind_direction, weather_condition, precipitation, visibility) VALUES
(1, '2025-09-22', 72.5, 65, 8.2, 'SW', 'Partly cloudy', 0.0, 10.0),
(1, '2025-09-21', 75.1, 58, 12.4, 'W', 'Sunny', 0.0, 10.0),
(1, '2025-09-20', 69.8, 72, 6.7, 'NW', 'Overcast', 0.1, 8.5),
(2, '2025-09-22', 68.4, 78, 15.6, 'SW', 'Foggy', 0.0, 3.2),
(3, '2025-09-22', 78.9, 45, 18.3, 'E', 'Windy', 0.0, 10.0),
(4, '2025-09-22', 82.3, 35, 22.1, 'SE', 'Clear', 0.0, 10.0),
(1, '2025-09-19', 71.2, 68, 9.8, 'N', 'Light rain', 0.3, 7.8);

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ===============================
-- SUMMARY OF INSERTED RECORDS
-- ===============================
-- Users: 20 records (1 admin, 2 staff, 3 members, 14 customers)
-- Courses: 4 records total (1 existing + 3 new)
-- Tee Times: 15 records
-- Range Sessions: 10 records  
-- Equipment Rentals: 8 records
-- Tournaments: 3 records
-- Tournament Participants: 12 records
-- Scorecards: 5 records
-- Payments: 10 records
-- Weather Logs: 7 records
-- TOTAL: 94+ records across all major tables

SELECT 'Data insertion completed successfully!' as status;