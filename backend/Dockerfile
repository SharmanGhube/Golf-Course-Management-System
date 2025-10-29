FROM golang:1.22-alpine3.19 AS builder

WORKDIR /app

# Install dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the application with security flags
RUN CGO_ENABLED=0 GOOS=linux go build \
    -ldflags="-w -s -X main.version=$(date +%Y%m%d-%H%M%S)" \
    -trimpath \
    -o main .

# Final stage - use specific alpine version
FROM alpine:3.19

# Install ca-certificates and create non-root user
RUN apk --no-cache add ca-certificates wget && \
    adduser -D -u 1000 appuser

WORKDIR /home/appuser

# Copy the binary from builder stage
COPY --from=builder /app/main .

# Create uploads directory with proper permissions
RUN mkdir -p uploads && \
    chown -R appuser:appuser /home/appuser

# Switch to non-root user
USER appuser

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:8080/health || exit 1

CMD ["./main"]
