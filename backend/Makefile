# Makefile for FastAPI application and Docker operations

# Variables
APP_NAME = medtrack
DOCKER_IMAGE = medtrack-api
DOCKER_TAG = latest

# FastAPI Development Server
.PHONY: run
run:
	fastapi dev main.py

# Docker commands
.PHONY: build
build:
	docker build -t $(DOCKER_IMAGE):$(DOCKER_TAG) .

.PHONY: docker-run
docker-run:
	docker run -d -p 8000:8000 --name $(APP_NAME) $(DOCKER_IMAGE):$(DOCKER_TAG)

.PHONY: docker-stop
docker-stop:
	docker stop $(APP_NAME)
	docker rm $(APP_NAME)

# Docker Compose commands
.PHONY: up
up:
	docker-compose up -d

.PHONY: down
down:
	docker-compose down

.PHONY: logs
logs:
	docker-compose logs -f

# Clean up
.PHONY: clean
clean:
	docker-compose down -v
	docker rmi $(DOCKER_IMAGE):$(DOCKER_TAG)
