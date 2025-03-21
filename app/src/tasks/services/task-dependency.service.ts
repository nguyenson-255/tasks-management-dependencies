import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
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
        const checkCircularDependencies = await this.checkForCycles(dependencyDto);
        console.log(checkCircularDependencies);

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

        // await this.sleep(100);
        // remove duplicate object
        return Array.from(new Map(allDependencies.map(task => [task.id, task])).values());
    }

    private async checkForCycles(dependencyDto: DependencyDto) {

        let graph = new Map<number, Set<number>>();
        let visited = new Set<number>();
        let stack = new Set<number>();

        const dependencyTask = await this.taskReponsitory.findOne({
            where: { id: dependencyDto.dependencyTaskId },
            relations: ["dependencies", "dependents"],
        });

        if (!dependencyTask) {
            throw new NotFoundException("Dependency Task not found");
        }

        this.addEdge(dependencyDto.dependentTaskId, dependencyDto.dependencyTaskId, graph);
        await this.loadTaskDependencies(dependencyTask, graph, visited);

        console.log(graph);

        visited = new Set<number>();

        // Run detectCycleDFS for each node in the graph
        for (const node of graph.keys()) {
            if (!visited.has(node) && this.detectCycleDFS(node, stack, visited, graph)) {
                return true;
            }
        }

        return false;
    }

    // dependencyTaskId <- dependentTaskId
    private addEdge(from: number, to: number, graph: Map<number, Set<number>>) {
        if (!graph.has(from)) graph.set(from, new Set());
        graph.get(from)!.add(to);
    }

    private async loadTaskDependencies(dependencyTask: Task, graph: Map<number, Set<number>>, visited: Set<number>) {
        if (visited.has(dependencyTask.id)) {
            return true;
        }

        visited.add(dependencyTask.id);

        for (const dep of dependencyTask.dependencies) {

            const temp = await this.taskReponsitory.findOne({
                where: { id: dep.id },
                relations: ["dependencies", "dependents"],
            });

            if (temp) {
                this.addEdge(dependencyTask.id, dep.id, graph);
                await this.loadTaskDependencies(temp, graph, visited);
            }
        }

        for (const dep of dependencyTask.dependents) {

            const temp = await this.taskReponsitory.findOne({
                where: { id: dep.id },
                relations: ["dependencies", "dependents"],
            });

            if (temp) {
                this.addEdge(dep.id, dependencyTask.id, graph);
                await this.loadTaskDependencies(temp, graph, visited);
            }
        }
    }

    private detectCycleDFS(node: number, stack: Set<number>, visited: Set<number>, graph: Map<number, Set<number>>): boolean {
        if (stack.has(node)) return true;
        if (visited.has(node)) return false;

        visited.add(node);
        stack.add(node);

        for (const neighbor of graph.get(node) ?? new Set()) {
            if (this.detectCycleDFS(neighbor, stack, visited, graph)) return true;
        }

        stack.delete(node);
        return false;
    }
}
