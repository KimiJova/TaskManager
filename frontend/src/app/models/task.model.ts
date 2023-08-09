// export interface Task {
    
//     // constructor(public title: string, public _id: string, public _listId: string) {
//     //     this.title = title;
//     //     this._id = _id;
//     //     this._listId = _listId;
//     // }

//     title: string;
//     _id: string;
//     _listId: string;

// }

export class Task {
    _id: string;
    title: string;
    _listId: string;
    completed: boolean;

    constructor(_id: string, title: string, _listId: string, completed: boolean){
        this._id = _id;
        this.title = title;
        this._listId = _listId;
        this.completed = completed;
    }
}