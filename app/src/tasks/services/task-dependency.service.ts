import {
    BadRequestException,
    Injectable,
    NotFoundException
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Task } from "../entities/task.entity";
import { Repository } from "typeorm";
import { DependencyDto } from "../dto/dependency.dto";

@Injectable()
export class TaskDependencyService {
    constructor(
        @InjectRepository(Task)
        private taskReponsitory: Repository<Task>
    ) { }

    // dependencyTaskId <- dependentTaskId
    async addTaskDependency(dependencyDto: DependencyDto) {
        const checkCircularDependencies = await this.validateCircularDependencies(dependencyDto);

        if (!checkCircularDependencies) {
            const dependentTask = await this.taskReponsitory.findOne({
                where: { id: dependencyDto.dependentTaskId },
                relations: ["dependencies"],
            });
            const dependencyTask = await this.taskReponsitory.findOne({
                where: { id: dependencyDto.dependencyTaskId },
            });

            if (!dependentTask || !dependencyTask) {
                throw new NotFoundException("Dependent/Dependency Task not found");
            }

            dependentTask.dependencies.push(dependencyTask);
            await this.taskReponsitory.save(dependentTask);
        } else {
            throw new BadRequestException("Circular Dependencies are detected");
        }
    }

    async removeTaskDependency(dependencyDto: DependencyDto) {
        const dependentTask = await this.taskReponsitory.findOne({
            where: { id: dependencyDto.dependentTaskId },
            relations: ["dependencies"],
        });

        if (!dependentTask) {
            throw new NotFoundException("Dependent Task not found");
        }

        dependentTask.dependencies = dependentTask.dependencies.filter(
            (e) => e.id !== dependencyDto.dependencyTaskId
        );
        await this.taskReponsitory.save(dependentTask);
    }

    async getTaskDependencies(id: number): Promise<Task[]> {
        const task = await this.taskReponsitory.findOne({
            where: { id },
            relations: ["dependencies"],
        });

        if (!task) {
            throw new NotFoundException("Task not found");
        }

        if (!task.dependencies || task.dependencies.length === 0) {
            return [];
        }

        let allDependencies: Task[] = [...task.dependencies];

        for (const dep of task.dependencies) {
            const subDependencies = await this.getTaskDependencies(dep.id);
            allDependencies.push(...subDependencies);
        }

        return allDependencies;
    }

    private async validateCircularDependencies(dependencyDto: DependencyDto) {
        const graph = new Map<number, Set<number>>();
        let visited = new Set<number>();
        const stack = new Set<number>();

        const dependencyTask = await this.taskReponsitory.findOne({
            where: { id: dependencyDto.dependencyTaskId },
            relations: ["dependencies", "dependents"],
        });

        if (!dependencyTask) {
            throw new NotFoundException("Dependency Task not found");
        }

        this.addEdge(dependencyDto.dependentTaskId, dependencyDto.dependencyTaskId, graph);
        await this.addEvery(dependencyTask, graph, visited);

        visited = new Set<number>();

        // Run DFS for each node in the graph
        for (const node of graph.keys()) {
            if (!visited.has(node) && this.dfs(node, stack, visited, graph)) {
                return true;
            }
        }

        return false;
    }

    addEdge(from: number, to: number, graph: Map<number, Set<number>>) {
        if (!graph.has(from)) graph.set(from, new Set());
        graph.get(from)!.add(to);
    }

    async addEvery(dependencyTask: Task, graph: Map<number, Set<number>>, visited: Set<number>) {
        if (visited.has(dependencyTask.id)) {
            return true;
        }

        visited.add(dependencyTask.id);

        for (const dep of dependencyTask.dependencies) {
            console.log(dep);

            const temp = await this.taskReponsitory.findOne({
                where: { id: dep.id },
                relations: ["dependencies", "dependents"],
            });

            if (temp) {
                this.addEdge(dependencyTask.id, dep.id, graph);
                await this.addEvery(temp, graph, visited);
            }
        }

        for (const dep of dependencyTask.dependents) {
            console.log(dep);

            const temp = await this.taskReponsitory.findOne({
                where: { id: dep.id },
                relations: ["dependencies", "dependents"],
            });

            if (temp) {
                this.addEdge(dep.id, dependencyTask.id, graph);
                await this.addEvery(temp, graph, visited);
            }
        }
    }

    dfs(node: number, stack: Set<number>, visited: Set<number>, graph: Map<number, Set<number>>): boolean {
        if (stack.has(node)) return true;
        if (visited.has(node)) return false;

        visited.add(node);
        stack.add(node);

        for (const neighbor of graph.get(node) ?? new Set()) {
            if (this.dfs(neighbor, stack, visited, graph)) return true;
        }

        stack.delete(node);
        return false;
    }
}
