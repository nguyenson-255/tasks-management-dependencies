export enum StatusEnum {
    NOT_STARTED = 'Not Started',
    IN_PROGRESS = 'In Progress',
    COMPLETED = 'Completed',
}

export const StatusEnumMapping: Record<number, StatusEnum> = {
    0: StatusEnum.NOT_STARTED,
    1: StatusEnum.IN_PROGRESS,
    2: StatusEnum.COMPLETED,
};