import { useEffect, useRef } from 'react';
import { tasksRepo } from '../db/tasksRepo';
import { generateId } from '../utils/uuid';

export function useTaskInit() {
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;

    tasksRepo.getAllLists().then((lists) => {
      if (lists.length === 0) {
        const defaultList = {
          id: generateId(),
          name: 'My Tasks',
          order: 0,
          color: undefined,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        tasksRepo.saveList(defaultList);
      }
    });
  }, []);
}
