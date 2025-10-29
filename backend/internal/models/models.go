package models

import (
	"time"
)

type User struct {
	ID               uint       `json:"id" gorm:"primaryKey"`
	Email            string     `json:"email" gorm:"unique;not null"`
	PasswordHash     string     `json:"-" gorm:"not null"`
	FirstName        string     `json:"first_name" gorm:"not null"`
	LastName         string     `json:"last_name" gorm:"not null"`
	Phone            string     `json:"phone"`
	DateOfBirth      *time.Time `json:"date_of_birth"`
	Role             string     `json:"role" gorm:"default:'customer'"`
	MembershipType   string     `json:"membership_type" gorm:"default:'basic'"`
	MembershipExpiry *time.Time `json:"membership_expiry"`
	Handicap         *float64   `json:"handicap"`
	AvatarURL        string     `json:"avatar_url"`
	IsActive         bool       `json:"is_active" gorm:"default:true"`
	EmailVerified    bool       `json:"email_verified" gorm:"default:false"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
}

type Course struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	Name         string    `json:"name" gorm:"not null"`
	Description  string    `json:"description"`
	Address      string    `json:"address"`
	Phone        string    `json:"phone"`
	Email        string    `json:"email"`
	Par          int       `json:"par" gorm:"default:72"`
	TotalHoles   int       `json:"total_holes" gorm:"default:18"`
	CourseRating *float64  `json:"course_rating"`
	SlopeRating  *int      `json:"slope_rating"`
	GreenFee     float64   `json:"green_fee"`
	CartFee      float64   `json:"cart_fee"`
	IsActive     bool      `json:"is_active" gorm:"default:true"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
	Holes        []Hole    `json:"holes,omitempty" gorm:"foreignKey:CourseID"`
}

type Hole struct {
	ID            uint   `json:"id" gorm:"primaryKey"`
	CourseID      uint   `json:"course_id" gorm:"not null"`
	HoleNumber    int    `json:"hole_number" gorm:"not null"`
	Par           int    `json:"par" gorm:"not null"`
	Yardage       int    `json:"yardage"`
	HandicapIndex int    `json:"handicap_index"`
	Description   string `json:"description"`
	Course        Course `json:"-" gorm:"constraint:OnDelete:CASCADE"`
}

type TeeTime struct {
	ID              uint      `json:"id" gorm:"primaryKey"`
	CourseID        uint      `json:"course_id" gorm:"not null"`
	UserID          uint      `json:"user_id" gorm:"not null"`
	BookingDate     time.Time `json:"booking_date" gorm:"not null"`
	TeeTime         string    `json:"tee_time" gorm:"not null"`
	PlayersCount    int       `json:"players_count" gorm:"default:1"`
	CartRequired    bool      `json:"cart_required" gorm:"default:false"`
	TotalAmount     float64   `json:"total_amount"`
	PaymentStatus   string    `json:"payment_status" gorm:"default:'pending'"`
	BookingStatus   string    `json:"booking_status" gorm:"default:'confirmed'"`
	SpecialRequests string    `json:"special_requests"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
	Course          Course    `json:"course,omitempty" gorm:"constraint:OnDelete:CASCADE"`
	User            User      `json:"user,omitempty" gorm:"constraint:OnDelete:CASCADE"`
}

type RangeSession struct {
	ID              uint      `json:"id" gorm:"primaryKey"`
	UserID          uint      `json:"user_id" gorm:"not null"`
	SessionDate     time.Time `json:"session_date" gorm:"not null"`
	StartTime       string    `json:"start_time" gorm:"not null"`
	DurationMinutes int       `json:"duration_minutes" gorm:"default:60"`
	BallBucketSize  string    `json:"ball_bucket_size" gorm:"not null"`
	BucketPrice     float64   `json:"bucket_price"`
	BayNumber       *int      `json:"bay_number"`
	PaymentStatus   string    `json:"payment_status" gorm:"default:'pending'"`
	SessionStatus   string    `json:"session_status" gorm:"default:'booked'"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
	User            User      `json:"user,omitempty" gorm:"constraint:OnDelete:CASCADE"`
}

type Equipment struct {
	ID                uint      `json:"id" gorm:"primaryKey"`
	Name              string    `json:"name" gorm:"not null"`
	Category          string    `json:"category" gorm:"not null"`
	Description       string    `json:"description"`
	RentalPricePerDay float64   `json:"rental_price_per_day"`
	QuantityAvailable int       `json:"quantity_available" gorm:"default:0"`
	ConditionStatus   string    `json:"condition_status" gorm:"default:'good'"`
	ImageURL          string    `json:"image_url"`
	IsAvailable       bool      `json:"is_available" gorm:"default:true"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
}

type EquipmentRental struct {
	ID            uint       `json:"id" gorm:"primaryKey"`
	UserID        uint       `json:"user_id" gorm:"not null"`
	EquipmentID   uint       `json:"equipment_id" gorm:"not null"`
	RentalDate    time.Time  `json:"rental_date" gorm:"not null"`
	ReturnDate    *time.Time `json:"return_date"`
	Quantity      int        `json:"quantity" gorm:"default:1"`
	RentalPrice   float64    `json:"rental_price"`
	DepositAmount float64    `json:"deposit_amount"`
	PaymentStatus string     `json:"payment_status" gorm:"default:'pending'"`
	RentalStatus  string     `json:"rental_status" gorm:"default:'rented'"`
	Notes         string     `json:"notes"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
	User          User       `json:"user,omitempty" gorm:"constraint:OnDelete:CASCADE"`
	Equipment     Equipment  `json:"equipment,omitempty" gorm:"constraint:OnDelete:CASCADE"`
}

type Scorecard struct {
	ID                 uint            `json:"id" gorm:"primaryKey"`
	UserID             uint            `json:"user_id" gorm:"not null"`
	CourseID           uint            `json:"course_id" gorm:"not null"`
	TeeTimeID          *uint           `json:"tee_time_id"`
	PlayedDate         time.Time       `json:"played_date" gorm:"not null"`
	TotalScore         *int            `json:"total_score"`
	TotalPutts         *int            `json:"total_putts"`
	FairwaysHit        *int            `json:"fairways_hit"`
	GreensInRegulation *int            `json:"greens_in_regulation"`
	HandicapUsed       *float64        `json:"handicap_used"`
	WeatherConditions  string          `json:"weather_conditions"`
	Notes              string          `json:"notes"`
	IsTournamentRound  bool            `json:"is_tournament_round" gorm:"default:false"`
	CreatedAt          time.Time       `json:"created_at"`
	User               User            `json:"user,omitempty" gorm:"constraint:OnDelete:CASCADE"`
	Course             Course          `json:"course,omitempty" gorm:"constraint:OnDelete:CASCADE"`
	TeeTime            *TeeTime        `json:"tee_time,omitempty" gorm:"constraint:OnDelete:SET NULL"`
	Holes              []ScorecardHole `json:"holes,omitempty" gorm:"foreignKey:ScorecardID"`
}

type ScorecardHole struct {
	ID                uint      `json:"id" gorm:"primaryKey"`
	ScorecardID       uint      `json:"scorecard_id" gorm:"not null"`
	HoleID            uint      `json:"hole_id" gorm:"not null"`
	Strokes           int       `json:"strokes" gorm:"not null"`
	Putts             int       `json:"putts" gorm:"default:0"`
	FairwayHit        bool      `json:"fairway_hit" gorm:"default:false"`
	GreenInRegulation bool      `json:"green_in_regulation" gorm:"default:false"`
	SandSaves         int       `json:"sand_saves" gorm:"default:0"`
	Penalties         int       `json:"penalties" gorm:"default:0"`
	Scorecard         Scorecard `json:"-" gorm:"constraint:OnDelete:CASCADE"`
	Hole              Hole      `json:"hole,omitempty" gorm:"constraint:OnDelete:CASCADE"`
}

type Payment struct {
	ID                    uint       `json:"id" gorm:"primaryKey"`
	UserID                uint       `json:"user_id" gorm:"not null"`
	ReferenceType         string     `json:"reference_type" gorm:"not null"`
	ReferenceID           uint       `json:"reference_id" gorm:"not null"`
	Amount                float64    `json:"amount" gorm:"not null"`
	Currency              string     `json:"currency" gorm:"default:'USD'"`
	PaymentMethod         string     `json:"payment_method" gorm:"default:'credit_card'"`
	StripePaymentIntentID string     `json:"stripe_payment_intent_id"`
	PaymentStatus         string     `json:"payment_status" gorm:"default:'pending'"`
	FailureReason         string     `json:"failure_reason"`
	ProcessedAt           *time.Time `json:"processed_at"`
	CreatedAt             time.Time  `json:"created_at"`
	UpdatedAt             time.Time  `json:"updated_at"`
	User                  User       `json:"user,omitempty" gorm:"constraint:OnDelete:CASCADE"`
}

type WeatherLog struct {
	ID               uint      `json:"id" gorm:"primaryKey"`
	CourseID         uint      `json:"course_id" gorm:"not null"`
	Date             time.Time `json:"date" gorm:"not null"`
	Temperature      *float64  `json:"temperature"`
	Humidity         *int      `json:"humidity"`
	WindSpeed        *float64  `json:"wind_speed"`
	WindDirection    string    `json:"wind_direction"`
	WeatherCondition string    `json:"weather_condition"`
	Precipitation    *float64  `json:"precipitation"`
	Visibility       *float64  `json:"visibility"`
	APIResponse      string    `json:"api_response" gorm:"type:json"`
	CreatedAt        time.Time `json:"created_at"`
	Course           Course    `json:"course,omitempty" gorm:"constraint:OnDelete:CASCADE"`
}

type SystemSetting struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	SettingKey   string    `json:"setting_key" gorm:"unique;not null"`
	SettingValue string    `json:"setting_value"`
	Description  string    `json:"description"`
	IsActive     bool      `json:"is_active" gorm:"default:true"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}
