# Smart Queue: Online Token & Queue Management System

## 1. Project Kya Hai

Ye ek full-stack web application hai jo queue aur token management ko online handle karta hai. Iska main purpose waiting time kam karna, queue ko digitally manage karna, aur customer ko real-time status dena hai.

Is project ko aap hospital, bank, clinic, government office, helpdesk, billing desk, diagnostic center, aur senior citizen support counter jaise use-cases me use kar sakte ho.

Is system me:

- customer online token book kar sakta hai
- customer apna live status dekh sakta hai
- TV board par current serving aur waiting preview dikh sakta hai
- agent counter se next token bula sakta hai
- agent service complete ya no-show mark kar sakta hai
- admin pure network ka dashboard dekh sakta hai
- email notification user ko bheji ja sakti hai

---

## 2. Project Ka High-Level Architecture

Project 2 main parts me divide hai:

- `backend/` -> Spring Boot + Spring Security + JPA + PostgreSQL
- `frontend/` -> React + Vite + Axios

Backend ka kaam:

- database entities manage karna
- token booking aur queue logic handle karna
- authentication aur authorization dena
- email bhejna
- admin, public aur agent APIs dena

Frontend ka kaam:

- public booking interface dikhana
- live status page dikhana
- TV display board dikhana
- admin dashboard dikhana
- agent workspace dikhana

---

## 3. Technology Stack

### Backend

- Java
- Spring Boot
- Spring Security
- Spring Data JPA
- PostgreSQL
- Java Mail Sender
- JWT Authentication

### Frontend

- React
- Vite
- Axios `1.6.2`
- React Router
- Lucide React icons
- QR Code generation

---

## 4. Application Ka Main Business Idea

Real life me queue ka flow is tarah hota hai:

1. customer kisi service ke liye token book karta hai
2. us token ko system queue me `WAITING` state me rakhta hai
3. assigned agent apne counter se `Call Next` karta hai
4. token `SERVING` state me chala jata hai
5. customer ka kaam complete hone par agent `Complete` karta hai
6. agar customer present nahi hai to agent `No Show` karta hai
7. uske baad hi next token ko bulaya jata hai

Yahi real-life flow is project me implement kiya gaya hai.

Important baat:

- system ab auto-complete nahi karta
- `Complete` ya `No Show` ka decision counter employee/agent leta hai
- next token tabhi move hota hai jab current token close ho jaye

---

## 5. Project Me Kaun Kaun Se Roles Hain

### 5.1 SUPER_ADMIN

Ye system ka top-level admin hota hai.

Iske kaam:

- overall network dashboard dekhna
- branches aur queues ka high-level status dekhna
- live serving snapshot dekhna

### 5.2 AGENT

Ye counter/operator/staff member hota hai.

Iske kaam:

- apne assigned counter ka workspace use karna
- next token bulana
- token ko complete karna
- token ko no-show mark karna

### 5.3 CUSTOMER

Customer login-based role ke form me stored nahi hai, lekin booking flow me user token book karta hai aur tracking page use karta hai.

---

## 6. Current Seeded Login Credentials

### Admin

- Username: `admin`
- Email: `sonagarasmit2006.com`
- Password: `Smit@2006`

### Agents

- `agent1` / `agent1.smartqueue@gmail.com` / `Mayur@2006`
- `agent2` / `agent2.smartqueue@gmail.com` / `Mayur@2006`
- `agent3` / `agent3.smartqueue@gmail.com` / `Mayur@2006`
- `agent4` / `agent4.smartqueue@gmail.com` / `Mayur@2006`
- `agent5` / `agent5.smartqueue@gmail.com` / `Mayur@2006`
- `agent6` / `agent6.smartqueue@gmail.com` / `Mayur@2006`

---

## 7. Seeded Branches, Queues, Counters Aur Agents

### Branch 1: Central Smart Queue Hub

Departments:

- Consultation
- Diagnostics
- Billing

Queues:

- General Consultation
- Priority Consultation
- Diagnostic Samples
- Billing & Claims

Counters:

- `CTR-1` -> Counter 1
- `CTR-2` -> Counter 2
- `CTR-3` -> Billing Counter
- `VIP-1` -> VIP Counter

Assigned agents:

- `agent1` -> `CTR-1` -> Consultation
- `agent3` -> `CTR-2` -> Diagnostics
- `agent4` -> `CTR-3` -> Billing
- `agent5` -> `VIP-1` -> Priority Consultation

### Branch 2: Care Plus Service Center

Departments:

- Citizen Support

Queues:

- Government Helpdesk
- Senior Citizen Assistance

Counters:

- `GOV-1` -> Gov Desk 1
- `SNR-1` -> Senior Desk

Assigned agents:

- `agent2` -> `GOV-1` -> Government Helpdesk
- `agent6` -> `SNR-1` -> Senior Citizen Assistance

---

## 8. Entity Kya Hoti Hai

Entity ka matlab hota hai database table ka Java model.

Simple words me:

- database me jo real-world object store hota hai usko entity kehte hain
- jaise user, branch, queue, token, counter

Ye project JPA entities use karta hai.

---

## 9. Sabhi Main Entities Aur Unke Attributes

Neeche har important entity ko simple Hindi me explain kiya gaya hai.

### 9.1 `Organization`

Ye top-level organization ko represent karta hai.

Typical attributes:

- `id` -> primary key
- `name` -> organization ka naam
- `code` -> short code
- `description` -> organization ka description
- `contactEmail` -> official email

Use:

- multiple branches ek organization ke under ho sakti hain

### 9.2 `Branch`

Ye organization ki individual branch ko represent karta hai.

Typical attributes:

- `id`
- `name`
- `location`
- `timezone`
- `supportEmail`
- `contactNumber`
- `organization`

Use:

- ek branch ke andar queues aur counters operate karte hain

### 9.3 `Department`

Ye branch ke andar service category ko represent karta hai.

Examples:

- Consultation
- Diagnostics
- Billing
- Citizen Support

Typical attributes:

- `id`
- `name`
- `branch`

Use:

- queue aur counter ko department-wise map karne ke liye

### 9.4 `ServiceQueue`

Ye actual queue hoti hai jisme customer token book karta hai.

Attributes:

- `id`
- `name` -> queue ka naam
- `prefix` -> token prefix, jaise `A`, `B`, `G`
- `serviceCode` -> short code
- `description` -> queue details
- `averageServiceTimeMinutes` -> average handling time
- `isActive` -> queue active hai ya nahi
- `currentServingToken` -> legacy/current serving number field
- `lastGeneratedToken` -> legacy/last token number field
- `currentTokenSequence` -> next token number generate karne ke liye sequence
- `branch` -> ye queue kis branch ki hai
- `department` -> ye queue kis department ki hai

Use:

- customer isi entity ke against token book karta hai

### 9.5 `Counter`

Ye physical ya virtual desk/window ko represent karta hai.

Attributes:

- `id`
- `name`
- `code`
- `isOnline`
- `branch`
- `department`
- `currentAgent`

Use:

- agent isi counter se next token handle karta hai
- counter ka department decide karta hai ki wo kis type ki queue handle karega

### 9.6 `AppUser`

Ye system user hota hai.

Attributes:

- `id`
- `username`
- `password`
- `fullName`
- `email`
- `phone`
- `emailNotificationsEnabled`
- `role`
- `organization`
- `branch`

Use:

- admin aur agent accounts isi table me store hote hain

### 9.7 `Token`

Ye sabse important entity hai. Ye customer ka booking record hai.

Attributes:

- `id`
- `tokenIdentifier` -> jaise `A001`, `B002`
- `sequenceNumber` -> internal sequence
- `type` -> `WALK_IN`, `ONLINE_APPOINTMENT`, `VIP`
- `status` -> `WAITING`, `SERVING`, `COMPLETED`, `NO_SHOW`
- `customerName`
- `customerPhone`
- `customerEmail`
- `notes`
- `serviceQueue`
- `counter`
- `agent`
- `issuedAt`
- `calledAt`
- `servedAt`
- `notifiedAt`

Use:

- booking ke baad ye record banta hai
- poora service lifecycle isi entity par track hota hai

### 9.8 `Country`

Location hierarchy ka top level.

Attributes:

- `id`
- `name`
- `isoCode`

### 9.9 `State`

Attributes:

- `id`
- `name`
- `country`

### 9.10 `City`

Attributes:

- `id`
- `name`
- `state`

Use:

- ye location hierarchy future expansion ke liye useful hai

---

## 10. Enums Kya Hain

Enum ka matlab hota hai fixed values ka set.

### 10.1 `Role`

Possible values:

- `SUPER_ADMIN`
- `ORG_ADMIN`
- `AGENT`
- `PROVIDER_ADMIN`  

Note:

- `PROVIDER_ADMIN` compatibility ke liye enum me present hai

### 10.2 `TokenType`

Possible values:

- `WALK_IN`
- `ONLINE_APPOINTMENT`
- `VIP`

Meaning:

- `WALK_IN` -> jo bina prior appointment ke aaye
- `ONLINE_APPOINTMENT` -> jo online booking ke through aaye
- `VIP` -> high-priority token

### 10.3 `TokenStatus`

Possible values:

- `WAITING`
- `SERVING`
- `COMPLETED`
- `NO_SHOW`

Meaning:

- `WAITING` -> token line me hai
- `SERVING` -> abhi service chal rahi hai
- `COMPLETED` -> kaam khatam ho gaya
- `NO_SHOW` -> customer time par present nahi tha

---

## 11. Entity Relationships

Ye project relational model use karta hai. Important relationships:

- ek `Organization` ke andar multiple `Branch` ho sakti hain
- ek `Branch` ke andar multiple `Department` ho sakte hain
- ek `Branch` ke andar multiple `ServiceQueue` ho sakti hain
- ek `Branch` ke andar multiple `Counter` ho sakte hain
- ek `Department` se multiple `ServiceQueue` linked ho sakti hain
- ek `Department` se multiple `Counter` linked ho sakte hain
- ek `ServiceQueue` me multiple `Token` hote hain
- ek `Counter` par ek current agent assigned hota hai
- ek `Token` optionally ek `Counter` aur ek `Agent` se linked hota hai jab wo serve ho raha ho

---

## 12. Frontend Pages Aur Unka Purpose

### `/`

Home page hai.

Yahan se user:

- kiosk open kar sakta hai
- staff login par ja sakta hai
- TV display open kar sakta hai

### `/login`

Ye admin aur agent dono ke liye common login page hai.

Behavior:

- admin login -> `/admin`
- agent login -> `/agent`

### `/kiosk`

Public booking page.

Customer yahan:

- branch select karta hai
- queue select karta hai
- apna naam, phone, email deta hai
- token type choose karta hai
- token generate karta hai

### `/status/:tokenId`

Live tracking page.

Yahan customer dekh sakta hai:

- token number
- status
- people ahead
- estimated wait
- counter name

### `/tv`

Live queue board.

Yahan dikhaya jata hai:

- now serving
- waiting preview
- branch-wise live board

### `/agent`

Counter agent workspace.

Agent yahan:

- current service dekhta hai
- `Call Next` karta hai
- `Complete` karta hai
- `No Show` karta hai

### `/admin`

Admin dashboard.

Admin yahan:

- total tokens
- live counters
- active serving
- branch network
- spotlight queues
- live serving snapshot dekh sakta hai

---

## 13. Backend API Modules

### 13.1 Public APIs

Base path:

- `/api/public`

Endpoints:

- `GET /branches`
- `GET /branches/{branchId}/queues`
- `POST /queues/{queueId}/tokens`
- `GET /tokens/{tokenId}/tracking`
- `GET /branches/{branchId}/board`

Use:

- public booking aur live tracking ke liye

### 13.2 Auth APIs

Base path:

- `/api/auth`

Endpoint:

- `POST /login`

Use:

- admin/agent login ke liye

### 13.3 Agent APIs

Base path:

- `/api/agent`

Endpoints:

- `GET /workspace`
- `POST /counters/{counterId}/next`
- `POST /tokens/{tokenId}/complete`
- `POST /tokens/{tokenId}/no-show`

Use:

- counter operation ke liye

### 13.4 Admin APIs

Base path:

- `/api/admin`

Endpoints:

- `GET /dashboard`
- `GET /setup`

Use:

- admin monitoring aur setup summary ke liye

---

## 14. Authentication Ka Flow

System JWT based authentication use karta hai.

Flow:

1. user `/api/auth/login` par username/email aur password bhejta hai
2. backend credentials verify karta hai
3. JWT token generate hota hai
4. frontend token ko local storage me save karta hai
5. next API requests me token Authorization header me bheja jata hai

Important:

- login username se bhi ho sakta hai
- login email se bhi ho sakta hai

---

## 15. Queue Logic Ka Detailed Working Flow

Ye sabse important section hai.

### Step 1: Customer Token Book Karta Hai

Customer kiosk par jata hai.

Wahan:

- branch select karta hai
- queue select karta hai
- naam, phone, email deta hai
- token type choose karta hai

Backend:

- selected queue ka `currentTokenSequence` increment hota hai
- new token identifier generate hota hai, jaise `A001`
- token `WAITING` state me save hota hai
- people ahead aur estimated wait calculate hota hai
- confirmation email bheji ja sakti hai

### Step 2: Token Waiting List Me Aata Hai

Token queue me store rehta hai.

Us waqt:

- status = `WAITING`
- counter assigned nahi hota
- agent assigned nahi hota

### Step 3: Agent Login Karta Hai

Agent `/login` page se login karta hai.

Usko system:

- uske role ke basis par authorize karta hai
- assigned counter ke workspace tak le jata hai

### Step 4: Agent `Call Next` Karta Hai

`Call Next` karne par:

- system check karta hai kya current counter par already koi `SERVING` token hai
- agar hai, to next token nahi bulaya jayega
- agar current token nahi hai, to counter ke department ke hisab se next eligible waiting token pick hota hai

Example:

- billing counter billing queue ka token uthayega
- consultation counter consultation queue ka token uthayega

### Step 5: Token Serving Me Jata Hai

Jab token call hota hai:

- status `SERVING` ho jata hai
- counter assign hota hai
- agent assign hota hai
- `calledAt` set hota hai
- notification email bheja ja sakta hai

### Step 6: Service Complete Ya No Show

Ab real-life decision agent leta hai.

Do possibilities:

- `Complete` -> customer ka kaam ho gaya
- `No Show` -> customer counter par nahi aaya

### Step 7: Next Token Tabhi Chalega

Jab tak current token `SERVING` me hai:

- agla token call nahi ho sakta

Current token close hote hi:

- agent next token call kar sakta hai

Ye behavior real service desk jaisa hai.

---

## 16. Priority Logic Kaise Kaam Karta Hai

System token type ke basis par priority ko consider karta hai.

Priority order:

1. `VIP`
2. `ONLINE_APPOINTMENT`
3. `WALK_IN`

Meaning:

- VIP sabse pehle
- phir online appointment
- phir normal walk-in

Saath me sequence/order bhi consider hota hai.

---

## 17. People Ahead Aur Estimated Wait Kaise Nikalta Hai

System queue-specific logics use karta hai.

People Ahead:

- same service queue me current token se pehle kitne relevant tokens hain

Estimated Wait:

- `peopleAhead * averageServiceTimeMinutes`

Agar token `SERVING` me hai to estimated wait `0` hota hai.

---

## 18. Email Notification Kaise Kaam Karta Hai

System Gmail SMTP use karta hai.

Current configured sender:

- Email: `sonagarasmit@gmail.com`

Notifications:

- booking confirmation email
- turn called email

Mail configuration hardcoded `application.yml` me hai.

---

## 19. Configuration File

Project configuration:

- `backend/src/main/resources/application.yml`

Isme currently:

- PostgreSQL datasource config
- JPA config
- Gmail SMTP config
- server port

Current important values:

- DB URL: `jdbc:postgresql://localhost:5432/Queue_System`
- DB Username: `postgres`
- DB Password: `Mayur@2006`
- Server Port: `8080`

---

## 20. Auto Seeding Ka Matlab Kya Hai

Jab backend start hota hai to `AdvancedDataSeeder` run hota hai.

Iska kaam:

- country/state/city banana
- organization banana
- branches banana
- departments banana
- queues banana
- counters banana
- admin banana
- agents banana
- agents ko counters par assign karna

Iska fayda:

- project first run me bhi ready state me milta hai

---

## 21. Important Java Classes Ka Purpose

### `AdvancedDataSeeder`

Startup par initial data insert/update karta hai.

### `AdvancedQueueManagerService`

Project ka main business logic yahin hai.

Isme:

- booking
- tracking
- live board
- agent workspace
- call next
- complete
- no-show
- admin dashboard

sab handle hota hai.

### `AuthenticationService`

Login logic handle karta hai.

### `JwtService`

JWT create aur validate karta hai.

### `JwtAuthenticationFilter`

Har request ke JWT token ko check karta hai.

### `EmailNotificationService`

Email notification bhejta hai.

---

## 22. Frontend State Aur Data Flow

Frontend me active pages fake hardcoded data use nahi karte. Ye real backend APIs se data lete hain.

Examples:

- kiosk -> real branches aur real queues fetch karta hai
- live status -> real token tracking fetch karta hai
- TV board -> real branch board fetch karta hai
- agent page -> real workspace aur action APIs use karta hai
- admin dashboard -> real admin APIs use karta hai

---

## 23. User Journey Examples

### 23.1 Public Customer Journey

1. `/kiosk` open karo
2. branch select karo
3. service queue select karo
4. details bharo
5. token generate karo
6. token number note karo
7. `/status/{tokenId}` par tracking dekho
8. turn aane par counter par jao

### 23.2 Agent Journey

1. `/login` par login karo
2. agent workspace open hoga
3. current token dekhna
4. `Call Next` karna
5. customer serve karna
6. `Complete` ya `No Show` karna
7. phir next token bulana

### 23.3 Admin Journey

1. `/login` par admin se login karo
2. `/admin` open hoga
3. metrics dekho
4. branches aur queues ka snapshot dekho
5. live serving monitor karo

---

## 24. Project Run Karne Ka Basic Tarika

### Backend

1. PostgreSQL chalu karo
2. database `Queue_System` available ho
3. backend folder me jao
4. run karo:

```powershell
./mvnw spring-boot:run
```

### Frontend

1. frontend folder me jao
2. run karo:

```powershell
npm install
npm run dev
```

Frontend default:

- `http://localhost:5173`

Backend default:

- `http://localhost:8080`

---

## 25. Testing Ke Liye Recommended Demo Flow

1. backend start karo
2. frontend start karo
3. `/kiosk` se ek hi queue me 2 tokens book karo
4. `/status/:id` par second token ka people ahead dekho
5. us queue ke assigned agent se login karo
6. `Call Next` karo
7. pehla token `SERVING` me chala jayega
8. `Complete` karo
9. fir `Call Next` karo
10. second token ab serve hona chahiye

---

## 26. Kis Queue Ko Kaunsa Agent Handle Karta Hai

Current practical mapping:

- General Consultation -> `agent1`
- Diagnostic Samples -> `agent3`
- Billing & Claims -> `agent4`
- Priority Consultation -> `agent5`
- Government Helpdesk -> `agent2`
- Senior Citizen Assistance -> `agent6`

---

## 27. Project Ki Strengths

- multi-branch architecture
- real queue lifecycle
- role-based login
- queue-specific tracking
- TV display support
- email integration
- auto-seeding
- JWT security
- real API based frontend

---

## 28. Project Ki Current Limitations

Ye project functional hai, lekin future me aur improve kiya ja sakta hai:

- admin UI se dynamic queue/counter creation
- customer cancellation flow
- reschedule support
- SMS notifications
- audit logs
- reports export
- holiday/working-hours management

---

## 29. Agar Aapko Project Bilkul Zero Se Samajhna Ho To Kahan Se Start Karein

Best order:

1. pehle `README.md` ka section 5 se 17 padho
2. phir `AdvancedDataSeeder` dekho
3. phir `AdvancedQueueManagerService` dekho
4. phir frontend ke pages dekho
5. phir live demo chala kar samjho

Recommended understanding sequence:

- role samjho
- branch/department/queue/counter relation samjho
- token entity samjho
- token lifecycle samjho
- agent workflow samjho

---

## 30. Sabse Important Summary

Agar bahut short me samajhna ho, to project ka core ye hai:

- `Branch` ke andar `Department` hote hain
- `Department` ke andar `Queues` aur `Counters` hote hain
- customer `Queue` me `Token` book karta hai
- `Agent` apne assigned `Counter` se next token handle karta hai
- `Token` states: `WAITING -> SERVING -> COMPLETED / NO_SHOW`
- `Admin` pure system ko monitor karta hai

Yahi is project ka complete heart hai.
