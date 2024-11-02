1. **Customer**  
- **Login/Logout**: log in/out
- **Vehicle Reservation**: view the locations of available vehicle
- **Vehicle Return**: system will designate a return location and calculate, deduct fees based on rental duration and vehicle type auto.
- **Fault Reporting**: report vehicle's breakdown so that operators can repair them timely
- **Account Payment**: Customers can pay the bill on their account.

2. **Operator**  
- **Vehicle Tracking**: Operators can view the real-time location of vehicles.
- **Vehicle Charging**: When a vehicle's battery is low, operators can charge the vehicle and record it.
- **Vehicle Maintenance**: repair damaged vehicles based on customer reports/system alerts.
- **Vehicle Dispatch**: Operators can dispatch vehicles to different locations as needed based on demand.

3. **Manager**  
- **Report Generation**: Generate reports, include all vehicle activities, usage frequency, and revenue. 
- The reports can be presented in bar charts.

4. **System Architecture**  
- **Front-End**: Bootstrap
- **Back-End**: Django
- **Database**:
    - **Vehicle Table**: Stores information about all vehicles (type, location, status, remaining battery).
    - **Customer Table**: Stores registered user information, account balance, and usage history.
    - **Order Table**: Records details of each rental, including start time, end time, vehicle used, and fees.
    - **Charging Station Table**: Records the location of each charging station and the number of available charging points.
    - **Fault Report Table**: Stores information about vehicle malfunctions reported by customers.
