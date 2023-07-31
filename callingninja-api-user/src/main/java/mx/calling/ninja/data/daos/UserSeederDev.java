package mx.calling.ninja.data.daos;

// import mx.calling.ninja.data.model.CustomerPoints;
import mx.calling.ninja.data.model.Role;
import mx.calling.ninja.data.model.User;
import org.apache.logging.log4j.LogManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
// import java.time.Period;
import java.util.Arrays;

@Repository // @Profile("dev")
public class UserSeederDev {

    private DatabaseStarting databaseStarting;
    private UserRepository userRepository;
//     private CustomerPointsRepository customerPointsRepository;

    @Autowired
//     public UserSeederDev(UserRepository userRepository, DatabaseStarting databaseStarting, CustomerPointsRepository customerPointsRepository) {
        public UserSeederDev(UserRepository userRepository, DatabaseStarting databaseStarting) {
        this.userRepository = userRepository;
        this.databaseStarting = databaseStarting;
        // this.customerPointsRepository = customerPointsRepository;
        // Al momento del arranque no realiza nada 
        //this.deleteAllAndInitializeAndSeedDataBase();
    }

    public void deleteAllAndInitializeAndSeedDataBase() {
        this.deleteAllAndInitialize();
        this.seedDataBase();
    }

    public void deleteAllAndInitialize() {
       // this.customerPointsRepository.deleteAll();
        this.userRepository.deleteAll();
        LogManager.getLogger(this.getClass()).warn("------- Deleted All -----------");
        this.databaseStarting.initialize();
    }

    private void seedDataBase() {
        LogManager.getLogger(this.getClass()).warn("------- Initial Load from JAVA -----------");
        String pass = new BCryptPasswordEncoder().encode("6");

        // private int id;
        // private String guid;
        // private String balance;
        // private String picture;
        // private int age;
        // private String eyeColor;
        // private String company;
        // @NonNull
        // @Column(unique = true, nullable = false)
        // private String mobile;
        // @NonNull
        // private String firstName;
        // private String lastName;
        // private String familyName;
        // private String email;
        // private String dni;
        // private String address;
        // private String password;
        // @Enumerated(EnumType.STRING)
        // private Role role;
        // private LocalDateTime registrationDate;
        // private Boolean active;


        User[] users = {
                User.builder().guid("eab0324c-75ef-49a1-9c49-be2d68f50b16").balance("$3,585.69").picture("http://localhost:4200/assets/images/eddie.png").age(30).eyeColor("blue").company("GEEKNET").mobile("6666660000").firstName("adm").password(pass).dni(null).address("121 National Drive, Cotopaxi, Michigan, 8240")
                        .email("adm@gmail.com").role(Role.ADMIN).registrationDate(LocalDateTime.now()).active(true)
                        .build(),
                User.builder().guid("eab0324c-75ef-49a1-9c49-be2d68f50w96").balance("$3,585.69").picture("http://localhost:4200/assets/images/eddie.png").age(30).eyeColor("blue").company("GEEKNET").mobile("666666001").firstName("man").password(pass).dni("66666601C").address("C/TPV, 1")
                        .email("man@gmail.com").role(Role.MANAGER).registrationDate(LocalDateTime.now()).active(true)
                        .build(),
                User.builder().guid("eab0324c-75ef-49a1-9c49-be2d68f50b26").balance("$3,585.69").picture("http://localhost:4200/assets/images/eddie.png").age(30).eyeColor("blue").company("GEEKNET").mobile("666666002").firstName("ope").password(pass).dni("66666602K").address("C/TPV, 2")
                        .email("ope@gmail.com").role(Role.OPERATOR).registrationDate(LocalDateTime.now()).active(true)
                        .build(),
                User.builder().guid("eab0324c-75ef-49a1-9c49-be2d68f50b16").balance("$3,585.69").picture("http://localhost:4200/assets/images/eddie.png").age(30).eyeColor("blue").company("GEEKNET").mobile("666666003").firstName("c1").familyName("ac1").password(pass).dni("66666603E")
                        .address("C/TPV, 3").email("c1@gmail.com").role(Role.CUSTOMER)
                        .registrationDate(LocalDateTime.now()).active(true).build(),
                User.builder().guid("eab0324c-75ef-49a1-9c49-be2d68a50b96").balance("$3,585.69").picture("http://localhost:4200/assets/images/eddie.png").age(30).eyeColor("blue").company("GEEKNET").mobile("666666004").firstName("c2").familyName("ac2").password(pass).dni("66666604T")
                        .address("C/TPV, 4").email("c2@gmail.com").role(Role.CUSTOMER)
                        .registrationDate(LocalDateTime.now()).active(true).build(),
                User.builder().guid("eab0324c-75ef-49a1-9c49-be2d68f20b96").balance("$3,585.69").picture("http://localhost:4200/assets/images/eddie.png").age(30).eyeColor("blue").company("GEEKNET").mobile("666666005").firstName("c3").password(pass).role(Role.CUSTOMER)
                        .registrationDate(LocalDateTime.now()).active(true).build(),
                User.builder().guid("eab0324c-75ef-49a1-9c49-be2d68f52b96").balance("$3,585.69").picture("http://localhost:4200/assets/images/eddie.png").age(30).eyeColor("blue").company("GEEKNET").mobile("666666006").firstName("c4").password(pass).role(Role.CUSTOMER)
                        .registrationDate(LocalDateTime.now()).active(true).build(),
                User.builder().guid("eab0324c-75ef-49a1-9c49-be2d68f50296").balance("$3,585.69").picture("http://localhost:4200/assets/images/eddie.png").age(30).eyeColor("blue").company("GEEKNET").mobile("666666007").firstName("c5").password(pass).role(Role.CUSTOMER)
                        .registrationDate(LocalDateTime.now()).active(true).build(),
                User.builder().guid("eab0324c-75ef-49a1-9c49-be2d68f50b26").balance("$3,585.69").picture("http://localhost:4200/assets/images/eddie.png").age(30).eyeColor("blue").company("GEEKNET").mobile("666666008").firstName("c6").password(pass).role(Role.CUSTOMER)
                        .registrationDate(LocalDateTime.now()).active(true).build(),
                User.builder().guid("eab0324c-75ef-49a1-9c49-be2d68f50b96").balance("$3,585.69").picture("http://localhost:4200/assets/images/eddie.png").age(30).eyeColor("blue").company("GEEKNET").mobile("66").firstName("customer").password(pass).role(Role.CUSTOMER)
                        .registrationDate(LocalDateTime.now()).active(true).build(),
        };
        // CustomerPoints[] customerPoints = {
        //         CustomerPoints.builder().user(users[3]).points(123)
        //                 .lastDate( LocalDateTime.now().minus(Period.ofDays(1)) ).build(),
        //         CustomerPoints.builder().user(users[4]).points(124)
        //                 .lastDate( LocalDateTime.now().plus(Period.ofYears(1)) ).build(),
        //         CustomerPoints.builder().user(users[5]).points(125)
        //                 .lastDate( LocalDateTime.now().plus(Period.ofYears(1)) ).build(),
        //         CustomerPoints.builder().user(users[6]).points(9)
        //                 .lastDate( LocalDateTime.now().plus(Period.ofYears(1)) ).build(),
        //         //users[7] skipped
        //         CustomerPoints.builder().user(users[8]).points(9)
        //                 .lastDate( LocalDateTime.now().plus(Period.ofYears(1)) ).build(),
        // };
        this.userRepository.saveAll(Arrays.asList(users));
        //this.customerPointsRepository.saveAll(Arrays.asList(customerPoints));
        LogManager.getLogger(this.getClass()).warn("        ------- users");
        
    }

}
