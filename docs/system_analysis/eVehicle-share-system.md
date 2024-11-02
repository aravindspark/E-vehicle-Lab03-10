## 1、Background Survey

​	pass

## 2、Requirements

 **1）Customers**

- **Log in/out**
- **Profile management**: includes the following points
  - create profile: when the create the account
  - modify profile
  - cancel profile(or cancel account)
  - search profile
- **Search vehicles:**  search vehicle's information, according to location,type,available time,and so on... 
- **Rent:** rent a vehicle at any location in the city, as long as there is a working vehicle available at that location.
- **Order management **: includes the following points
  - Create order(add)
  - Cancel order(delete)
  - Modify order(modify)
  - Search order(search)
  - Close order: once the returned the vehicle and pay the order, the order would the closed. see "Return"(**Pay** any charges on their account)

- **Return:** return a vehicle to any location. When a customer returns a vehicle, their account is charged depending on how long the vehicle rental was and what type of vehicle was used.(In a way similar to the "Close order" 🤔 )

- **Report**: report a vehicle as defective.
- **comment/feedback**:  (maybe this should be in the "Order management")

**2）Operators**

- **Vehicle info management**: includes the following points

  - add vehicles: Add vehicles to different locations around the city as needed
  - modify vehicles
    - static information, such as types, name, id, created_time...
    - dynamic Information(status), such as reparing,charging...
      - **Charge** a vehicle when the battery is depleted.
      - **Repair** a defective vehicle.
      - **Move** vehicles to different locations around the city as needed.
  - search vehicles
    - **Track** the location of all vehicles in the city.
  - delete vehicles

- **Order management**: same as customers

  - search orders
  - modify orders
  - close orders

  > the operator cannot delete/create order themselves.

- ***Profile management**: Does they need to manage their account, OR managed by the managers?*

**3）Managers**

- **Profile management**: same as customers.
- **Financial reports**
- **Generate reports** showing all vehicle activities over a defined time period, using appropriate **data visualisation** techniques.



## 3、Design

### 3.1 Total Design

Separation of front-end and back-end

- UI：bootstrap(HTML、CSS、JS )
- backend: Django(Python)  REST Framework
- database: mysql、postgres？ or sqlite or something like Nosql
- APIs: payment API、google map API?

> Does it need to be deployed on the server?

### 3.2 Database Design

1. table Customer
2. table Operator
3. table Vehicle
4. table Order
5. table Payment
6. view xxx_reports