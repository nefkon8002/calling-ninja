package mx.calling.ninja.services;

import mx.calling.ninja.data.daos.UserRepository;
import mx.calling.ninja.data.model.Role;
import mx.calling.ninja.data.model.User;
import mx.calling.ninja.services.exceptions.ConflictException;
import mx.calling.ninja.services.exceptions.ForbiddenException;
import mx.calling.ninja.services.exceptions.NotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;
import java.util.Arrays;
@Service
public class UserService {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    @Autowired
    public UserService(UserRepository userRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    public Optional< String > login(String mobile) {
        System.out.println("INPUT DATA " + mobile);
        return this.userRepository.findByMobile(mobile)
                .map(user -> jwtService.createToken(user.getMobile(), user.getFirstName(), user.getRole().name()));
                
    }

    public void createUser(User user, Role roleClaim) {
        
        System.out.println("CREANDO USUARIO 2 -> " + user );

        if (!authorizedRoles(roleClaim).contains(user.getRole())) {
            System.out.println("ERROR EXCEPTION -> Insufficient role to create this user: " + user );
            throw new ForbiddenException("Insufficient role to create this user: " + user);
        }
        this.assertNoExistByMobile(user.getMobile());
        user.setRegistrationDate(LocalDateTime.now());
        this.userRepository.save(user);
    }

    public Stream< User > readAll(Role roleClaim) {
        return this.userRepository.findByRoleIn(authorizedRoles(roleClaim)).stream();
    }

    private List< Role > authorizedRoles(Role roleClaim) {
        if (Role.ADMIN.equals(roleClaim)) {
            return Arrays.asList(Role.ADMIN, Role.MANAGER, Role.OPERATOR, Role.CUSTOMER);
        } else if (Role.MANAGER.equals(roleClaim)) {
            return Arrays.asList(Role.MANAGER, Role.OPERATOR, Role.CUSTOMER);
        } else if (Role.OPERATOR.equals(roleClaim)) {
            return Arrays.asList(Role.CUSTOMER);
        } else {
            return Arrays.asList();
        }
    }

    private void assertNoExistByMobile(String mobile) {
        if (this.userRepository.findByMobile(mobile).isPresent()) {
            throw new ConflictException("The mobile already exists: " + mobile);
        }
    }

    public Stream< User > findByMobileAndFirstNameAndFamilyNameAndEmailAndDniContainingNullSafe(
            String mobile, String firstName, String familyName, String email, String dni, Role roleClaim) {
        return this.userRepository.findByMobileAndFirstNameAndFamilyNameAndEmailAndDniContainingNullSafe(
                mobile, firstName, familyName, email, dni, this.authorizedRoles(roleClaim)
        ).stream();
    }

    public User readByMobileAssured(String mobile) {
        return this.userRepository.findByMobile(mobile)
                .orElseThrow(() -> new NotFoundException("The mobile don't exist: " + mobile));
    }
    public void updateUser(User user, Role roleClaim) {
        if (!authorizedRoles(roleClaim).contains(user.getRole())) {
            throw new ForbiddenException("Insufficient role to update this user: " + user);
        }
        //this.assertNoExistByMobile(user.getMobile());
        user.setRegistrationDate(LocalDateTime.now());

        // if (this.userRepository.findByMobile(user.getMobile()).isPresent()) {
        //     user.setId(user.getId());
        //    // throw new ConflictException("The mobile already exists: " + mobile);
        // }
        //dinamicUpdate(String company,String eyeColor, int age,String picture,String balance,String firstName,String lastName,String email,String dni,String address,String active);
        // user.setCompany("PLUSNETWORK.COM");
        // user.setEyeColor("BLUEEEE");
        // user.setAge(30);    
        this.userRepository.dinamicUpdate(user.getCompany(),user.getEyeColor(),user.getAge(),user.getPicture(),user.getBalance(),user.getFirstName(),user.getLastName(),user.getFamilyName(),user.getEmail(),user.getDni(),user.getAddress(),user.getActive(),user.getMobile(),user.getTwilio_sid(),user.getTwilio_auth());
        
        //this.userRepository.dinamicUpdate("PLUSNETWORK","BLUE",89,user.getPicture(),user.getBalance(),user.getFirstName(),user.getLastName(),user.getEmail(),user.getDni(),user.getAddress(),user.getActive(),user.getMobile());
        
        //this.userRepository.dinamicUpdate(user.getCompany(),user.getEyeColor(),user.getAge(),user.getPicture(),user.getMobile());
       

        // this.userRepository.save(user);
    }
}
