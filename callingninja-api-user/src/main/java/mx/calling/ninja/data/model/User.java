package mx.calling.ninja.data.model;

import lombok.*;
import javax.persistence.*;
import java.time.LocalDateTime;

@Builder
@Data //@ToString, @EqualsAndHashCode, @Getter, @Setter, @RequiredArgsConstructor
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "callingninjaUser") // conflict with user table
public class User {
    @Id
    @GeneratedValue
    private int id;
    private String guid;
    private String balance;
    private String picture;
    private int age;
    private String eyeColor;
    private String company;
    @NonNull
    @Column(unique = true, nullable = false)
    private String mobile;
    @NonNull
    private String firstName;
    private String lastName;
    private String familyName;
    private String email;
    private String dni;
    private String address;
    private String password;
    @Enumerated(EnumType.STRING)
    private Role role;
    private LocalDateTime registrationDate;
    private Boolean active;
    private String twilio_sid;
    private String twilio_auth;
    private String test;
}

// id
// active
// address
// dni
// email
// family_name
// first_name
// mobile
// password
// registration_date
// role
//------------------------

// "_id": "5410953eb0e0c0ae25608277",
// "guid": "eab0324c-75ef-49a1-9c49-be2d68f50b96",
// "isActive": true,
// "balance": "$3,585.69",
// "picture": "http://placehold.it/32x32",
// "age": 30,
// "eyeColor": "blue",
// "name": {
// "first": "Henderson",
// "last": "Briggs"
// },
// "company": "GEEKNET",
// "email": "henderson.briggs@geeknet.net",
// "password": "23derd*334",
// "phone": "+1 (936) 451-3590",
// "address": "121 National Drive, Cotopaxi, Michigan, 8240"