import { Injectable, NotFoundException } from "@nestjs/common";
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

        const test = await this.validateCircularDependencies(dependencyDto)
        console.log(test);

        const dependentTask = await this.taskReponsitory.findOne({
            where: { id: dependencyDto.dependentTaskId },
            relations: ['dependencies']
        });
        const dependencyTask = await this.taskReponsitory.findOne({
            where: { id: dependencyDto.dependencyTaskId }
        });

        if (!dependentTask || !dependencyTask) {
            throw new NotFoundException('Dependent/Dependency Task not found');
        }

        dependentTask.dependencies.push(dependencyTask);

        await this.taskReponsitory.save(dependentTask);
    }

    async removeTaskDependency(dependencyDto: DependencyDto) {
        const dependentTask = await this.taskReponsitory.findOne({
            where: { id: dependencyDto.dependentTaskId },
            relations: ['dependencies']
        });
        if (!dependentTask) {
            throw new NotFoundException('Dependent Task not found');
        }
        dependentTask.dependencies = dependentTask.dependencies.filter(e => { e.id != dependencyDto.dependencyTaskId })
        await this.taskReponsitory.save(dependentTask);
    }

    async getTaskDependencies(id: number): Promise<Task[]> {

        const task = await this.taskReponsitory.findOne({
            where: { id: id },
            relations: ['dependencies']
        })

        if (!task) {
            throw new NotFoundException('Task not found');
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
        //23
        const dependentTask = await this.taskReponsitory.findOne({
            where: { id: dependencyDto.dependentTaskId },
            relations: ['dependencies', 'dependents']
        });

        //22
        const dependencyTask = await this.taskReponsitory.findOne({
            where: { id: dependencyDto.dependencyTaskId },
            relations: ['dependencies', 'dependents']
        });

        if (!dependentTask || !dependencyTask) {
            throw new NotFoundException('Dependent/Dependency Task not found');
        }

        // console.log('pre', dependentTask.dependencies);

        dependencyTask.dependents.push(dependentTask);

        // console.log('pre1', dependentTask.dependencies);


        // visited = 1 // in progress
        // visited = 2 // done
        // let visited = new Map<number, number>();
        const graph = new Map<number, number[]>();
        const visited = new Set<number>();
        // Function to add an edge


        this.addEdge(dependentTask.id,dependencyTask.id, graph);

        console.log(dependencyTask.dependencies);
        
        if (await this.addEvery(dependencyTask, graph, visited)) {
            return true; // 🔥 Cycle detected, stop!
        }
    
        console.log(graph);

        return false;
        // return await this.dfs(visited, dependencyTask)
    }

    addEdge(from: number, to: number, graph: Map<number, number[]>) {
        if (!graph.has(from)) graph.set(from, []);
        graph.get(from)!.push(to);
    }

    // Function to recursively add all dependencies
    async addEvery(dependencyTask: Task, graph: Map<number, number[]>, visited: Set<number>) {
        if (visited.has(dependencyTask.id)) {
            console.log(`Cycle detected at node ${dependencyTask.id}`);
            return true; // 🔥 Cycle detected!
        }
    
        visited.add(dependencyTask.id); // Mark as visited

        for (const dep of dependencyTask.dependencies) {
            console.log(dep);
            
            const temp = await this.taskReponsitory.findOne({
                where: { id: dep.id },
                relations: ['dependencies'],
            });
            if (temp) {

                console.log(temp.dependencies);
                
                this.addEdge(dependencyTask.id, dep.id, graph);
                if (await this.addEvery(temp, graph, visited)) {
                    return true;
                }
            }
        }

        visited.delete(dependencyTask.id);
        return false;
    }

    private async dfs(visited: Map<number, number>, node: Task) {

        if (visited.get(node.id) === 1) return true;
        if (visited.get(node.id) === 2) return false;

        for (let neighbor of node.dependencies || []) {
            const temp = await this.taskReponsitory.findOne({
                where: { id: neighbor.id },
                relations: ['dependencies', 'dependents'],
            })
            if (temp) {
                if (await this.dfs(visited, temp)) return true;
            }
        }
        visited.set(node.id, 2);
        return false;
    }
}