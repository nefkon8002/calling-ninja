package mx.calling.ninja.services;

import mx.calling.ninja.data.daos.UserRepository;
import mx.calling.ninja.data.model.Role;
import mx.calling.ninja.data.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
@Qualifier("miw.users")
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Autowired
    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // @Override
    // public UserDetails loadUserByUsername(final String mobile) {
    //     User user = userRepository.findByMobile(mobile)
    //             .orElseThrow(() -> new UsernameNotFoundException("mobile not found. " + mobile));
    //     return this.userBuilder(user.getMobile(), user.getPassword(), new Role[]{Role.AUTHENTICATED}, user.getActive());
    // }
    @Override
    public UserDetails loadUserByUsername(final String mobile) {

        System.out.println("BASIC AUTHENTICATION " + mobile);
        if (mdnRegex(mobile)){
            User user = userRepository.findByMobile(mobile)
            .orElseThrow(() -> new UsernameNotFoundException("mobile not found. " + mobile));
            return this.userBuilder(user.getMobile(), user.getPassword(), new Role[]{Role.AUTHENTICATED}, user.getActive());
        }else if (emailRegex(mobile)){
            User user = userRepository.findByEmail(mobile)
            .orElseThrow(() -> new UsernameNotFoundException("email not found. " + mobile));
            return this.userBuilder(user.getMobile(), user.getPassword(), new Role[]{Role.AUTHENTICATED}, user.getActive());
        }else{
            // lanzy ar excepcion input excepcion solo se permiten numeros telefonicos 
            throw new UsernameNotFoundException("ERROR InputException - Solo se permiten numeros moviles y email. " + mobile); 
        }
    
    }

    public boolean mdnRegex(String cadena) {
        return cadena.matches("[0-9]*");
    }
    
    public boolean emailRegex(String cadena) {
        return cadena.matches("^[\\w-+]+(\\.[\\w-]{1,62}){0,126}@[\\w-]{1,63}(\\.[\\w-]{1,62})+/[\\w-]+$");
    }

    private org.springframework.security.core.userdetails.User userBuilder(String mobile, String password, Role[] roles,
                                                                           boolean active) {
        List< GrantedAuthority > authorities = new ArrayList<>();
        for (Role role : roles) {
            authorities.add(new SimpleGrantedAuthority(role.withPrefix()));
        }
        return new org.springframework.security.core.userdetails.User(mobile, password, active, true,
                true, true, authorities);
    }
}
