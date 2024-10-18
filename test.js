
    let users= [
      {
        "name": "Aarav Sharma",
        "email": "aarav.sharma@example.com",
        "designation": "Software Engineer"
      },
      {
        "name": "Diya Gupta",
        "email": "diya.gupta@example.com",
        "designation": "Graphic Designer"
      },
      {
        "name": "Vihaan Patel",
        "email": "vihaan.patel@example.com",
        "designation": "Product Manager"
      }
    ]
  
    let existingUSers = [
        { email: 'aarav.sharma@example.com' },
        { email: 'diya.gupta@example.com' },
        
    ]


    const existingMailMap = new Map(existingUSers.map(user=>[user.email,true]))
    console.log("existingMapMail",existingMailMap);
    

    // output
 /*   existingMapMail Map(2) {
        'aarav.sharma@example.com' => true,
        'diya.gupta@example.com' => true
      }
   */   
  