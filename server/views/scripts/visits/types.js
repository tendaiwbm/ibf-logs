const VisitsPrototype = {
        app: "visits",

        validate_date_input() { console.log("this function validates the start & end dates"); },

        generate_logs_table(event,start_date,end_date) {
                var dateRange = {
                                 "startDate": start_date.value,
                                 "endDate": end_date.value
                                };
                request(construct_url(dateRange),VisitsPrototype.generate_table_response);      
        },

        invoke_generate_table(event) {
                VisitsPrototype.generate_logs_table(event,document.getElementById("start-date"),document.getElementById("end-date"));
        },

        generate_table_response(event,response) {
                const x = JSON.parse(response);
                console.log(Object.keys(x).length,x);
        },
};
/*
const Table = {
                page: 0,
                construct_request() { console.log("this function constructs the url to request records for the table"); },
                response_handler() { console.log("this function handles the table response"); },
                add_event_listeners() { console.log("this function attaches event listeners to events"); }
};

const Graph = {
                construct_request() { console.log("this function constructs the url to request records for the table"); },
                response_handler() { console.log("this function handles the table response"); },
                add_event_listeners() { console.log("this function attaches event listeners to events"); }
};

function main() {
        types = [Graph,Table];
        for (i=0; i < types.length, i++) {
                Object.assign(types[i].prototype,VisitsPrototype);
        };
};
*/

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