class Visits {
    validate_date_input(date_object) { 
        if ((date_object["startDate"] === "" & date_object["endDate"] != "") || 
           (date_object["endDate"] === "" & date_object["startDate"] != "")) {
            alert("Start and end dates must either both be populated or null."); 
        }
        else {
            if (date_object["startDate"] === "" & date_object["endDate"] === "") { return null; }
            else { return `${date_object["startDate"]},${date_object["endDate"]}`; }
        }
    }
}

class Table extends Visits {

    constructor() {
        super();
        this.page = 0;
        this.pointer = null;
    }
        
    static construct_url(date_string) { 
        var url = `${BASE}v=table&date=${date_string}`;
        console.log(url);
        return url;
    }
        
    add_event_listeners() { 
        var button = document.getElementById("generate-logs-table");
        button.addEventListener("click",this.invoke_generate_table);
        console.log("this function attaches event listeners to events"); 
    }    
        
    static response_handler(event,response) {
        const x = JSON.parse(response);
        console.log(Object.keys(x).length,x);
    }

    static generate_table(event,start_date,end_date) {
        var dateRange = {
                     "startDate": document.getElementById("start-date").value,
                     "endDate": document.getElementById("end-date").value
                    };
        var dateString = this.prototype.validate_date_input(dateRange);
        request(Table.construct_url(dateString),Table.response_handler);
        
    }

    invoke_generate_table(event) {
        Table.generate_table(event,document.getElementById("start-date"),document.getElementById("end-date"));
    }
}

const Graph = {
                construct_request() { console.log("this function constructs the url to request records for the table"); },
                response_handler() { console.log("this function handles the table response"); },
                add_event_listeners() { console.log("this function attaches event listeners to events"); }
};

(function main() {
        //Object.assign(Table.prototype,VisitsPrototype);
        const table = new Table();
        table.add_event_listeners();
}) ();


/* 
   OBJECT LITERALS not ideal when 
   creating & updating numerous objects
   with the same properties & methods

// using a function to create an object
function create_person(name) {
        const obj = {};
        obj.name = name;
        obj.intro = function() { console.log(`Hoi. Ik ben ${this.name}`); };
        return obj;
}
const wiebenik = create_person("Tendai");
*/

// FUNCTION CONSTRUCTORS
/* 
        1. use the keyword "new"
        2. bind "this" to the new object

function Person(name) {
        this.name = name;
        this.intro = function() { console.log(`Hoi. Ik ben ${this.name}`); };
}
const whoami = new Person("Tendai");
*/
/*
        OBJECT PROTOTYPES
        mechanisms through which JS objects
        inherit features from one another
        ie. an object gets properties & methods 
            of prototype object,
            as well as those of the 
            prototype of the prototype
            and so on


// setting an object's prototype using Object.create()
// you create a prototype if needed or use an existing
const personPrototype = {
        greet() { console.log(`Ndinobva ku ${this.city}`); }
};
const museyamwa = Object.create(personPrototype);
museyamwa.city = "Mas Vegas";

// setting prototype using a constructor
Object.assign(Person.prototype,personPrototype);
//Person.prototype.greet = personPrototype.greet;
mbweezy = new Person("Mbweezy");
mbweezy.city = "Mas Vegas";
*/