package mx.calling.ninja.api.resources;

import mx.calling.ninja.api.dtos.TokenDto;
import mx.calling.ninja.api.dtos.UserDto;
import mx.calling.ninja.data.model.Role;
import mx.calling.ninja.services.UserService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or hasRole('OPERATOR')")
@RestController
@RequestMapping(UserResource.USERS)
public class UserResource {
    public static final String USERS = "/users";

    public static final String TOKEN = "/token";
    public static final String MOBILE_ID = "/{mobile}";
    public static final String SEARCH = "/search";
    public static final String SIGNUP = "/signup";

    private final UserService userService;

    @Autowired
    public UserResource(UserService userService) {
        this.userService = userService;
    }

    @SecurityRequirement(name = "basicAuth")
    @CrossOrigin(origins = "*") //
    @PreAuthorize("authenticated")
    @PostMapping(value = TOKEN)
    public Optional<TokenDto> login(@AuthenticationPrincipal User activeUser) {
        return userService.login(activeUser.getUsername())
                .map(TokenDto::new);
    }

    @SecurityRequirement(name = "bearerAuth")
    @PostMapping
    public void createUser(@Valid @RequestBody UserDto creationUserDto) {
        System.out.println("CREANDO USUARIO -> " + creationUserDto.toString() );
        this.userService.createUser(creationUserDto.toUser(), this.extractRoleClaims());
    }

    @SecurityRequirement(name = "bearerAuth")
    @GetMapping(MOBILE_ID)
    public UserDto readUser(@PathVariable String mobile) {
        return new UserDto(this.userService.readByMobileAssured(mobile));
    }

    @SecurityRequirement(name = "bearerAuth")
    @GetMapping
    public Stream<UserDto> readAll() {
        return this.userService.readAll(this.extractRoleClaims())
                .map(UserDto::ofMobileFirstName);
    }

    @SecurityRequirement(name = "bearerAuth")
    @GetMapping(value = SEARCH)
    public Stream<UserDto> findByMobileAndFirstNameAndFamilyNameAndEmailAndDniContainingNullSafe(
            @RequestParam(required = false) String mobile, @RequestParam(required = false) String firstName,
            @RequestParam(required = false) String familyName, @RequestParam(required = false) String email,
            @RequestParam(required = false) String dni, @RequestParam(required = false) String twilio_sid,
            @RequestParam(required = false) String twilio_auth) {
        return this.userService.findByMobileAndFirstNameAndFamilyNameAndEmailAndDniContainingNullSafe(
                mobile, firstName, familyName, email, dni, twilio_sid, twilio_auth, this.extractRoleClaims()).map(UserDto::ofMobileFirstName);
    }

    private Role extractRoleClaims() {
        List<String> roleClaims = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .map(GrantedAuthority::getAuthority).collect(Collectors.toList());
        return Role.of(roleClaims.get(0)); // it must only be a role
    }

    @SecurityRequirement(name = "bearerAuth")
    @PutMapping(MOBILE_ID)
    public void updateUser(@Valid @RequestBody UserDto updateUserDto) {
        this.userService.updateUser(updateUserDto.toUser(), this.extractRoleClaims());
    }

    // @SecurityRequirement(name = "bearerAuth")
    // @PostMapping(SIGNUP)
    // public void signupUser(@Valid @RequestBody UserDto creationUserDto) {
    //     this.userService.createUser(creationUserDto.toUser(), this.extractRoleClaims());
    // }

}
