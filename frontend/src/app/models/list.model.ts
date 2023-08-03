// export interface List {
    
//     // constructor(public title: string, public _id: string) {
//     //     this.title = title;
//     //     this._id = _id;
//     // }

//     title: string;
//     _id: string;
// }

export class List {
    _id: string;
    title: string;

    constructor(_id: string, title: string){
        this._id = _id;
        this.title = title;
    }
}