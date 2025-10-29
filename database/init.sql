-- Golf Course Management System Database Schema

-- Create database
CREATE DATABASE IF NOT EXISTS golf_course_db;
USE golf_course_db;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    role ENUM('admin', 'staff', 'member', 'customer') DEFAULT 'customer',
    membership_type ENUM('premium', 'standard', 'basic') DEFAULT 'basic',
    membership_expiry DATE,
    handicap DECIMAL(3,1),
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Golf courses table
CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    par INT DEFAULT 72,
    total_holes INT DEFAULT 18,
    course_rating DECIMAL(3,1),
    slope_rating INT,
    green_fee DECIMAL(10,2),
    cart_fee DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Course holes table
CREATE TABLE holes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    hole_number INT NOT NULL,
    par INT NOT NULL,
    yardage INT,
    handicap_index INT,
    description TEXT,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_course_hole (course_id, hole_number)
);

-- Tee times table
CREATE TABLE tee_times (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    user_id INT NOT NULL,
    booking_date DATE NOT NULL,
    tee_time TIME NOT NULL,
    players_count INT DEFAULT 1,
    cart_required BOOLEAN DEFAULT FALSE,
    total_amount DECIMAL(10,2),
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    booking_status ENUM('confirmed', 'cancelled', 'completed') DEFAULT 'confirmed',
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_tee_time (course_id, booking_date, tee_time)
);

-- Golf range sessions table
CREATE TABLE range_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    duration_minutes INT DEFAULT 60,
    ball_bucket_size ENUM('small', 'medium', 'large', 'jumbo') NOT NULL,
    bucket_price DECIMAL(8,2),
    bay_number INT,
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    session_status ENUM('booked', 'active', 'completed', 'cancelled') DEFAULT 'booked',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Equipment table
CREATE TABLE equipment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category ENUM('clubs', 'bags', 'carts', 'accessories') NOT NULL,
    description TEXT,
    rental_price_per_day DECIMAL(8,2),
    quantity_available INT DEFAULT 0,
    condition_status ENUM('excellent', 'good', 'fair', 'maintenance') DEFAULT 'good',
    image_url VARCHAR(500),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Equipment rentals table
CREATE TABLE equipment_rentals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    equipment_id INT NOT NULL,
    rental_date DATE NOT NULL,
    return_date DATE,
    quantity INT DEFAULT 1,
    rental_price DECIMAL(8,2),
    deposit_amount DECIMAL(8,2),
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    rental_status ENUM('rented', 'returned', 'overdue', 'damaged') DEFAULT 'rented',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE
);

-- Scorecards table
CREATE TABLE scorecards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    tee_time_id INT,
    played_date DATE NOT NULL,
    total_score INT,
    total_putts INT,
    fairways_hit INT,
    greens_in_regulation INT,
    handicap_used DECIMAL(3,1),
    weather_conditions VARCHAR(100),
    notes TEXT,
    is_tournament_round BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (tee_time_id) REFERENCES tee_times(id) ON DELETE SET NULL
);

-- Scorecard holes table
CREATE TABLE scorecard_holes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    scorecard_id INT NOT NULL,
    hole_id INT NOT NULL,
    strokes INT NOT NULL,
    putts INT DEFAULT 0,
    fairway_hit BOOLEAN DEFAULT FALSE,
    green_in_regulation BOOLEAN DEFAULT FALSE,
    sand_saves INT DEFAULT 0,
    penalties INT DEFAULT 0,
    FOREIGN KEY (scorecard_id) REFERENCES scorecards(id) ON DELETE CASCADE,
    FOREIGN KEY (hole_id) REFERENCES holes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_scorecard_hole (scorecard_id, hole_id)
);

-- Tournaments table
CREATE TABLE tournaments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    course_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    entry_fee DECIMAL(10,2),
    max_participants INT,
    tournament_type ENUM('stroke_play', 'match_play', 'scramble', 'best_ball') DEFAULT 'stroke_play',
    status ENUM('upcoming', 'active', 'completed', 'cancelled') DEFAULT 'upcoming',
    prize_pool DECIMAL(12,2),
    registration_deadline DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Tournament participants table
CREATE TABLE tournament_participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tournament_id INT NOT NULL,
    user_id INT NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    handicap_at_registration DECIMAL(3,1),
    payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
    final_score INT,
    final_position INT,
    prize_amount DECIMAL(10,2),
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_tournament_participant (tournament_id, user_id)
);

-- Payments table
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    reference_type ENUM('tee_time', 'range_session', 'equipment_rental', 'tournament', 'membership') NOT NULL,
    reference_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method ENUM('credit_card', 'debit_card', 'cash', 'bank_transfer') DEFAULT 'credit_card',
    stripe_payment_intent_id VARCHAR(255),
    payment_status ENUM('pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded') DEFAULT 'pending',
    failure_reason TEXT,
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Weather logs table
CREATE TABLE weather_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    date DATE NOT NULL,
    temperature DECIMAL(5,2),
    humidity INT,
    wind_speed DECIMAL(5,2),
    wind_direction VARCHAR(10),
    weather_condition VARCHAR(100),
    precipitation DECIMAL(5,2),
    visibility DECIMAL(5,2),
    api_response JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_course_date (course_id, date)
);

-- System settings table
CREATE TABLE system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default course
INSERT INTO courses (name, description, address, phone, email, par, total_holes, course_rating, slope_rating, green_fee, cart_fee) 
VALUES (
    'Pine Valley Golf Club',
    'Championship 18-hole golf course with stunning views and challenging play for all skill levels.',
    '123 Golf Course Drive, Pine Valley, CA 90210',
    '+1-555-GOLF-123',
    'info@pinevalleygolf.com',
    72,
    18,
    72.5,
    135,
    75.00,
    25.00
);

-- Insert holes for the default course
INSERT INTO holes (course_id, hole_number, par, yardage, handicap_index, description) VALUES
(1, 1, 4, 385, 10, 'Gentle opening hole with bunkers guarding the green'),
(1, 2, 3, 165, 16, 'Short par 3 over water to elevated green'),
(1, 3, 5, 520, 2, 'Long par 5 with dogleg right'),
(1, 4, 4, 410, 8, 'Straight par 4 with fairway bunkers'),
(1, 5, 3, 185, 14, 'Challenging par 3 with deep bunkers'),
(1, 6, 4, 375, 12, 'Medium length par 4 with narrow fairway'),
(1, 7, 5, 545, 4, 'Reachable par 5 for long hitters'),
(1, 8, 4, 425, 6, 'Uphill par 4 to tiered green'),
(1, 9, 3, 175, 18, 'Scenic par 3 finishing the front nine'),
(1, 10, 4, 395, 9, 'Downhill par 4 starting the back nine'),
(1, 11, 3, 155, 17, 'Short par 3 with pin placement challenges'),
(1, 12, 5, 560, 1, 'Longest hole on the course, par 5'),
(1, 13, 4, 440, 5, 'Demanding par 4 with water hazard'),
(1, 14, 3, 195, 13, 'Long par 3 requiring accurate iron play'),
(1, 15, 4, 365, 11, 'Shorter par 4 with strategic positioning'),
(1, 16, 5, 515, 3, 'Risk/reward par 5 with water carry'),
(1, 17, 4, 450, 7, 'Challenging par 4 with OB left'),
(1, 18, 3, 205, 15, 'Spectacular finishing hole par 3');

-- Insert default equipment
INSERT INTO equipment (name, category, description, rental_price_per_day, quantity_available, condition_status) VALUES
('Beginner Club Set', 'clubs', 'Complete set of clubs perfect for beginners', 25.00, 10, 'good'),
('Intermediate Club Set', 'clubs', 'Quality club set for intermediate players', 35.00, 8, 'excellent'),
('Premium Club Set', 'clubs', 'Professional grade clubs for advanced players', 50.00, 5, 'excellent'),
('Golf Cart Bag', 'bags', 'Large golf bag with cart strap', 10.00, 15, 'good'),
('Stand Bag', 'bags', 'Lightweight stand bag for walking', 8.00, 12, 'good'),
('Electric Golf Cart', 'carts', 'Electric golf cart for two players', 30.00, 20, 'excellent'),
('Push Cart', 'carts', 'Manual push cart for golf bags', 15.00, 25, 'good'),
('Golf Shoes', 'accessories', 'Spike golf shoes various sizes', 12.00, 30, 'good'),
('Golf Gloves', 'accessories', 'Leather golf gloves all sizes', 5.00, 50, 'excellent'),
('Range Finder', 'accessories', 'GPS range finder device', 20.00, 8, 'excellent');

-- Insert system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('booking_advance_days', '30', 'Maximum days in advance for tee time booking'),
('cancellation_hours', '24', 'Minimum hours before cancellation without penalty'),
('range_session_duration', '60', 'Default range session duration in minutes'),
('small_bucket_balls', '50', 'Number of balls in small bucket'),
('medium_bucket_balls', '75', 'Number of balls in medium bucket'),
('large_bucket_balls', '100', 'Number of balls in large bucket'),
('jumbo_bucket_balls', '150', 'Number of balls in jumbo bucket'),
('small_bucket_price', '8.00', 'Price for small ball bucket'),
('medium_bucket_price', '12.00', 'Price for medium ball bucket'),
('large_bucket_price', '16.00', 'Price for large ball bucket'),
('jumbo_bucket_price', '22.00', 'Price for jumbo ball bucket'),
('weather_api_key', '', 'OpenWeatherMap API key'),
('stripe_publishable_key', '', 'Stripe publishable key'),
('stripe_secret_key', '', 'Stripe secret key');

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_tee_times_date ON tee_times(booking_date);
CREATE INDEX idx_tee_times_user ON tee_times(user_id);
CREATE INDEX idx_range_sessions_date ON range_sessions(session_date);
CREATE INDEX idx_range_sessions_user ON range_sessions(user_id);
CREATE INDEX idx_equipment_rentals_user ON equipment_rentals(user_id);
CREATE INDEX idx_scorecards_user ON scorecards(user_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(payment_status);
