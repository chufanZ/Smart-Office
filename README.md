# Smart-Office

Raspberry Pi is responsible for collecting sensor data and controlling the switches of the two Plugwise sockets according to the control instructions of the PC.

PC is responsible for receiving data from Raspberry Pi and storing it in the database. It also generates control instructions based on the data through AI Planning, and stores them in the database, then sends them to Raspberry Pi.

The Webpage is responsible for displaying current and historical data, current status, and sending reminder emails.
