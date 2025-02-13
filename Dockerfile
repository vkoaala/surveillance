FROM golang:1.23-alpine AS builder

RUN apk add --no-cache gcc musl-dev sqlite-dev nodejs npm

WORKDIR /app

COPY ./backend/go.mod ./backend/go.sum ./
RUN go mod download

COPY ./frontend /app/frontend
WORKDIR /app/frontend
RUN npm install && npm run build
WORKDIR /app

COPY ./backend /app/backend
WORKDIR /app/backend

ENV CGO_ENABLED=1

RUN go build -o /app/surveillance -ldflags "-s -w" ./cmd

FROM alpine:latest

LABEL org.opencontainers.image.source https://github.com/vkoaala/surveillance

RUN apk add --no-cache tzdata

WORKDIR /app

COPY --from=builder /app/frontend/dist ./frontend
COPY --from=builder /app/surveillance .

RUN mkdir -p /app/db

EXPOSE 8080
CMD ["./surveillance"]
