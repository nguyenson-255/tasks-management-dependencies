# NestJS API with Docker, Redis, and PostgreSQL

## 📌 Project Overview
This is a **NestJS-based API** that uses:
- **PostgreSQL** for database storage
- **Redis** for caching
- **Docker** for containerization & CI/CD

With this setup, you can efficiently manage API requests, cache responses, and deploy seamlessly using Docker.

---

## 📂 Project Structure
```
/tasks-management-dependencies
│── README.md               # Project documentation
│── docker-compose.yml      # Docker Compose setup
│── app/Dockerfile          # Docker configuration
│── app/src/                # Source code (controllers, services, modules)
```

---

## 🛠️ Installation & Setup

### **️ Clone the repository**
```bash
git clone https://github.com/nguyenson-255/tasks-management-dependencies.git

cd tasks-management-dependencies
```

### **Run with Docker**
```bash
docker-compose up -d --build
```
- `-d` runs the containers in the background.
- `--build` ensures fresh builds for any changes.

### **Stop & Remove Containers**
```bash
docker-compose down
```
- `-v` ensures remove volumes.

---

## 🚀 Usage

### **API Endpoints**

| Method | Endpoint                          | Description                     | Arguments                          |
|--------|----------------------------------|---------------------------------|----------------------------------|
| GET    | `/tasks`                         | Get all tasks                   | none |
| POST   | `/tasks`                         | Create a new task               | `{ title: string, description?: string, dueDate: Date, priority?: PriorityEnum }` (body) |
| PUT    | `/tasks/:id`                     | Update an existing task         | `{ title?: string, description?: string, dueDate?: Date, priority?: PriorityEnum, status?: StatusEnum }` (body) |
| DELETE | `/tasks/:id`                     | Delete a task                   | None                             |
| GET    | `/tasks/addTaskDependency`       | Add dependencies between tasks           | `{ dependentTaskId: number, dependencyTaskId: number }` (query params) |
| GET    | `/tasks/removeTaskDependency`    | Remove dependencies between tasks        | `{ dependentTaskId: number, dependencyTaskId: number }` (query params) |
| GET    | `/tasks/getTaskDependencies/:id` | Get all dependencies of a task, including both direct dependencies (first level) and indirect dependencies (all subsequent levels).     | `id: number` (path param)       |

### **Enum**

- PriorityEnum

| Key    | Value   |
|---------|--------|
| LOW     | 'low'  |
| MEDIUM  | 'medium' |
| HIGH    | 'high'  |

- StatusEnum

| Key          | Value         |
|--------------|--------------|
| NOT_STARTED  | 'Not Started' |
| IN_PROGRESS  | 'In Progress' |
| COMPLETED    | 'Completed'   |

---

## 📌 Technologies Used
✅ **NestJS** - TypeScript-based backend framework  
✅ **PostgreSQL** - Relational database  
✅ **Redis** - Caching system  
✅ **Docker** - Containerization & CI/CD  

---

