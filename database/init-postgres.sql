-- PostgreSQL version of init.sql for Golf Course Management System
-- This is a conversion of the MySQL schema to PostgreSQL

-- Drop existing tables if they exist (in correct order to handle foreign keys)
DROP TABLE IF EXISTS scorecard_holes CASCADE;
DROP TABLE IF EXISTS scorecards CASCADE;
DROP TABLE IF EXISTS equipment_rentals CASCADE;
DROP TABLE IF EXISTS equipment CASCADE;
DROP TABLE IF EXISTS range_sessions CASCADE;
DROP TABLE IF EXISTS tee_times CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS weather_logs CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS holes CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    membership_type VARCHAR(50),
    membership_expiry TIMESTAMP,
    handicap DECIMAL(4,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    num_holes INTEGER NOT NULL,
    par INTEGER NOT NULL,
    length_yards INTEGER,
    difficulty_rating DECIMAL(3,1),
    slope_rating INTEGER,
    is_active BOOLEAN DEFAULT true,
    green_fee DECIMAL(10,2),
    cart_fee DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Holes table
CREATE TABLE holes (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    hole_number INTEGER NOT NULL,
    par INTEGER NOT NULL,
    length_yards INTEGER NOT NULL,
    handicap_index INTEGER,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, hole_number)
);

-- Tee Times table
CREATE TABLE tee_times (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tee_time TIMESTAMP NOT NULL,
    num_players INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'confirmed',
    cart_required BOOLEAN DEFAULT false,
    total_amount DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Range Sessions table
CREATE TABLE range_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_end TIMESTAMP,
    bucket_size VARCHAR(20),
    amount_paid DECIMAL(10,2),
    bay_number INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Equipment table
CREATE TABLE equipment (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    equipment_type VARCHAR(50),
    description TEXT,
    quantity INTEGER DEFAULT 0,
    available_quantity INTEGER DEFAULT 0,
    rental_price DECIMAL(10,2),
    condition VARCHAR(20) DEFAULT 'good',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Equipment Rentals table
CREATE TABLE equipment_rentals (
    id SERIAL PRIMARY KEY,
    equipment_id INTEGER NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rental_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    return_date TIMESTAMP,
    quantity INTEGER DEFAULT 1,
    rental_price DECIMAL(10,2),
    deposit_amount DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scorecards table
CREATE TABLE scorecards (
    id SERIAL PRIMARY KEY,
    tee_time_id INTEGER NOT NULL REFERENCES tee_times(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    total_score INTEGER,
    total_putts INTEGER,
    fairways_hit INTEGER,
    greens_in_regulation INTEGER,
    play_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    weather_condition VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scorecard Holes table
CREATE TABLE scorecard_holes (
    id SERIAL PRIMARY KEY,
    scorecard_id INTEGER NOT NULL REFERENCES scorecards(id) ON DELETE CASCADE,
    hole_id INTEGER NOT NULL REFERENCES holes(id) ON DELETE CASCADE,
    strokes INTEGER NOT NULL,
    putts INTEGER DEFAULT 0,
    fairway_hit BOOLEAN DEFAULT false,
    green_in_regulation BOOLEAN DEFAULT false,
    penalties INTEGER DEFAULT 0,
    notes TEXT,
    UNIQUE(scorecard_id, hole_id)
);

-- Payments table
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tee_time_id INTEGER REFERENCES tee_times(id) ON DELETE SET NULL,
    equipment_rental_id INTEGER REFERENCES equipment_rentals(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_type VARCHAR(50),
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'pending',
    transaction_id VARCHAR(100),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Weather Logs table
CREATE TABLE weather_logs (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    temperature DECIMAL(5,2),
    humidity INTEGER,
    wind_speed DECIMAL(5,2),
    condition VARCHAR(50),
    precipitation DECIMAL(5,2),
    visibility DECIMAL(5,2),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System Settings table
CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_tee_times_date ON tee_times(tee_time);
CREATE INDEX idx_tee_times_user ON tee_times(user_id);
CREATE INDEX idx_tee_times_course ON tee_times(course_id);
CREATE INDEX idx_scorecards_user ON scorecards(user_id);
CREATE INDEX idx_scorecards_course ON scorecards(course_id);
CREATE INDEX idx_scorecards_date ON scorecards(play_date);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_equipment_rentals_user ON equipment_rentals(user_id);
CREATE INDEX idx_equipment_rentals_status ON equipment_rentals(status);

-- Insert default admin user (password: 'admin123' - CHANGE THIS!)
-- Password hash for 'admin123' using bcrypt
INSERT INTO users (username, email, password_hash, full_name, role, is_active)
VALUES ('admin', 'admin@golfcourse.com', '$2a$10$YourHashHere', 'System Administrator', 'admin', true);

-- Insert sample course
INSERT INTO courses (name, description, num_holes, par, length_yards, difficulty_rating, slope_rating, green_fee, cart_fee)
VALUES ('Championship Course', 'Our premier 18-hole championship golf course', 18, 72, 6800, 72.5, 135, 75.00, 25.00);

-- Insert sample holes for the course
INSERT INTO holes (course_id, hole_number, par, length_yards, handicap_index)
SELECT 1, generate_series, 
       CASE WHEN generate_series IN (3, 8, 12, 17) THEN 3
            WHEN generate_series IN (2, 5, 11, 14) THEN 5
            ELSE 4 END,
       CASE WHEN generate_series IN (3, 8, 12, 17) THEN 175
            WHEN generate_series IN (2, 5, 11, 14) THEN 525
            ELSE 400 END,
       generate_series
FROM generate_series(1, 18);

-- Insert sample equipment
INSERT INTO equipment (name, equipment_type, description, quantity, available_quantity, rental_price)
VALUES 
    ('Golf Cart - Standard', 'cart', 'Standard 2-person golf cart', 20, 20, 25.00),
    ('Golf Cart - Premium', 'cart', 'Premium 2-person cart with GPS', 10, 10, 35.00),
    ('Club Set - Beginner', 'clubs', 'Full set for beginners', 15, 15, 30.00),
    ('Club Set - Premium', 'clubs', 'Premium club set', 8, 8, 50.00),
    ('Range Finder', 'accessories', 'Laser range finder', 12, 12, 15.00),
    ('Golf Umbrella', 'accessories', 'Large golf umbrella', 25, 25, 5.00);

-- Insert system settings
INSERT INTO system_settings (setting_key, setting_value, description)
VALUES 
    ('booking_advance_days', '30', 'Maximum days in advance for tee time booking'),
    ('cancellation_hours', '24', 'Minimum hours before tee time for free cancellation'),
    ('max_players_per_booking', '4', 'Maximum players per tee time booking'),
    ('range_open_time', '06:00', 'Driving range opening time'),
    ('range_close_time', '20:00', 'Driving range closing time'),
    ('small_bucket_balls', '50', 'Number of balls in small bucket'),
    ('medium_bucket_balls', '100', 'Number of balls in medium bucket'),
    ('large_bucket_balls', '150', 'Number of balls in large bucket'),
    ('small_bucket_price', '8.00', 'Price for small bucket'),
    ('medium_bucket_price', '12.00', 'Price for medium bucket'),
    ('large_bucket_price', '15.00', 'Price for large bucket');

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tee_times_updated_at BEFORE UPDATE ON tee_times 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scorecards_updated_at BEFORE UPDATE ON scorecards 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
