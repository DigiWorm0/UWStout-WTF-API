const API_INFO = {
    name: "UW-Stout Connect API Wrapper",
    description: "A simple API wrapper for UW-Stout's Connect API because reasons.",
    paths: {
        "users": {
            "top": {
                description: "Returns users in order of points.",
                parameters: {
                    "offset": {
                        description: "The offset of the first user to return.",
                        type: "number",
                        default: 0,
                    },
                    "limit": {
                        description: "The maximum number of users to return.",
                        type: "number",
                        default: 100,
                    },
                }
            },
            "search": {
                description: "Returns users whose first or last names contain the query.",
                parameters: {
                    "query": {
                        description: "The query to search for.",
                        type: "string",
                        default: "",
                    },
                }
            },
            "count": {
                description: "Returns the total number of users.",
                parameters: {}
            },
        },
        "events": {
            "recent": {
                description: "Returns the most recent events.",
                parameters: {
                    "offset": {
                        description: "The offset of the first event to return.",
                        type: "number",
                        default: 0,
                    },
                    "limit": {
                        description: "The maximum number of events to return.",
                        type: "number",
                        default: 100,
                    },
                },
            },
            "count": {
                description: "Returns the total number of events.",
                parameters: {}
            },
        }
    }
};

export default API_INFO;